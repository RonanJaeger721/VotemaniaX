import { redirect } from 'next/navigation';
import { getContestantForUser, getSessionUser } from '@/lib/auth';
export async function requireContestant() {
  const user = await getSessionUser();
  if (!user || user.role !== 'contestant') redirect('/auth/contestant/login');
  const contestant = await getContestantForUser(user.id);
  if (!contestant) redirect('/auth/contestant/login');
  return { user, contestant };
}
