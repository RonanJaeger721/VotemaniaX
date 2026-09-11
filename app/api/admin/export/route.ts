import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { contestants, events, payments, subscribers, votes } from '@/db/schema';

const sources = { events, participants: contestants, payments, subscribers, votes } as const;

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const dataset = new URL(request.url).searchParams.get('dataset') as keyof typeof sources;
  if (!dataset || !sources[dataset]) return NextResponse.json({ message: 'Unsupported dataset' }, { status: 400 });
  const rows = await getDb().select().from(sources[dataset]);
  const keys = rows.length ? Object.keys(rows[0]) : Object.keys(sources[dataset]);
  const csv = [keys.join(','), ...rows.map((row) => keys.map((key) => quote((row as Record<string, unknown>)[key])).join(','))].join('\r\n');
  return new NextResponse(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="votemaniax-${dataset}.csv"` } });
}

function quote(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}
