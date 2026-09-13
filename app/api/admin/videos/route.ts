import { NextResponse } from 'next/server';
import { appUrl } from '@/lib/app-url';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { auditLogs, videoSubmissions } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
const allowed = new Set(['published', 'approved', 'needs_changes', 'rejected']);
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await request.formData();
  const id = Number(data.get('id'));
  const status = String(data.get('status'));
  if (!id || !allowed.has(status))
    return NextResponse.json({ error: 'Invalid review' }, { status: 400 });
  const now = new Date();
  await getDb()
    .update(videoSubmissions)
    .set({
      status,
      adminNote: String(data.get('note') ?? ''),
      reviewedAt: now,
      publishedAt: status === 'published' ? now : null,
    })
    .where(eq(videoSubmissions.id, id));
  await getDb()
    .insert(auditLogs)
    .values({
      adminUserId: user.userId,
      action: `video.${status}`,
      entityType: 'video_submission',
      entityId: String(id),
      payload: JSON.stringify({ note: String(data.get('note') ?? '') }),
      createdAt: now,
    });
  return NextResponse.redirect(
    appUrl(request, '/admin/video-review'),
    303,
  );
}
