import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { videoConsents, videoSubmissions } from '@/db/schema';
import { getContestantForUser, getSessionUser } from '@/lib/auth';
import { getCurrentRound } from '@/lib/platform-store';
const consentText =
  'I confirm I own or have permission to submit this content and allow VoteManiaX administrators to review it. If approved, I allow VoteManiaX to display this content on the platform for this competition.';
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'contestant')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const contestant = await getContestantForUser(user.id);
  if (!contestant)
    return NextResponse.json(
      { error: 'Contestant profile not found' },
      { status: 403 },
    );
  const data = await request.formData();
  if (data.get('consent') !== 'on')
    return NextResponse.redirect(
      new URL('/contestant/videos?error=consent', request.url),
      303,
    );
  const files = data
    .getAll('videos')
    .filter((item): item is File => item instanceof File);
  if (!files.length || files.length > 8)
    return NextResponse.redirect(
      new URL('/contestant/videos?error=files', request.url),
      303,
    );
  const allowed = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
  if (
    files.some(
      (file) =>
        !allowed.has(file.type) ||
        file.size > 100 * 1024 * 1024 ||
        file.size === 0,
    )
  )
    return NextResponse.redirect(
      new URL('/contestant/videos?error=file', request.url),
      303,
    );
  const round = await getCurrentRound();
  const db = getDb();
  for (const [index, file] of files.entries()) {
    const storageKey = `contestants/${contestant.id}/${crypto.randomUUID()}-${file.name.replaceAll(/[^a-zA-Z0-9._-]/g, '_')}`;
    await env.FILES.put(storageKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
    const [video] = await db
      .insert(videoSubmissions)
      .values({
        contestantId: contestant.id,
        eventId: contestant.eventId,
        roundId: round?.id,
        storageKey,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        title:
          String(data.get('title') ?? 'Submission') +
          (files.length > 1 ? ` ${index + 1}` : ''),
        caption: String(data.get('caption') ?? ''),
        status: 'pending',
        createdAt: new Date(),
      })
      .returning();
    await db
      .insert(videoConsents)
      .values({
        videoId: video.id,
        contestantId: contestant.id,
        version: '2026-09-10',
        consentText,
        sessionMetadata: JSON.stringify({
          userAgent: request.headers.get('user-agent'),
        }),
        createdAt: new Date(),
      });
  }
  return NextResponse.redirect(
    new URL('/contestant/videos?uploaded=1', request.url),
    303,
  );
}
