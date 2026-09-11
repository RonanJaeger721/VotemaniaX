import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { contestantAccounts, videoSubmissions } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getSessionUser } from '@/lib/auth';
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  const video = (
    await getDb()
      .select()
      .from(videoSubmissions)
      .where(eq(videoSubmissions.id, id))
      .limit(1)
  )[0];
  if (!video) return new Response('Not found', { status: 404 });
  let allowed = video.status === 'published';
  if (!allowed) {
    if (await getChatGPTUser()) allowed = true;
    const user = await getSessionUser();
    if (user) {
      const owner = (
        await getDb()
          .select()
          .from(contestantAccounts)
          .where(eq(contestantAccounts.userId, user.id))
          .limit(1)
      )[0];
      allowed = owner?.contestantId === video.contestantId;
    }
  }
  if (!allowed) return new Response('Not found', { status: 404 });
  const object = await env.FILES.get(video.storageKey);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'content-type': video.contentType,
      'content-length': String(video.size),
      'cache-control':
        video.status === 'published'
          ? 'public, max-age=3600'
          : 'private, no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
