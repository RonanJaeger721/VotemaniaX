import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export function ContestantCard({
  item,
  index,
  voteHref,
}: {
  item: { slug: string; name: string; category: string; votes: number };
  index: number;
  voteHref?: string;
}) {
  return (
    <article className={`contestant-card card-${index % 3}`}>
      <div className="contestant-visual">
        <span>{item.name.charAt(0)}</span>
        <b>#{String(index + 1).padStart(2, '0')}</b>
      </div>
      <div className="contestant-copy">
        <small>{item.category}</small>
        <h2>{item.name}</h2>
        <div>
          <span>{item.votes} verified votes</span>
          <Link href={`/contestants/${item.slug}`}>
            Profile <ArrowUpRight size={15} />
          </Link>
          {voteHref ? (
            <Link className="mini-vote" href={`${voteHref}/${item.slug}`}>
              Vote
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
