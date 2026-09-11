'use client';
import Link from 'next/link';
import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
export function VoteCheckout({
  item,
  event,
}: {
  item: { name: string; slug: string };
  event: { name: string; currency: string; votePrice: number } | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [custom, setCustom] = useState('');
  const [method, setMethod] = useState('ecocash');
  const price = event?.votePrice ?? 0;
  const effective =
    quantity === 0 ? Math.max(1, Number(custom) || 1) : quantity;
  return (
    <form className="checkout-card">
      <span className="checkout-avatar">{item.name.charAt(0)}</span>
      <div>
        <small>YOUR CONTESTANT</small>
        <h2>{item.name}</h2>
        <p>{event?.name ?? 'No live event'}</p>
      </div>
      <fieldset>
        <legend>Number of votes</legend>
        {[1, 5, 10, 20, 50].map((q) => (
          <label key={q}>
            <input
              type="radio"
              name="quantity"
              value={q}
              checked={quantity === q}
              onChange={() => setQuantity(q)}
            />
            <span>{q}</span>
          </label>
        ))}
        <label>
          <input
            type="radio"
            name="quantity"
            value="custom"
            checked={quantity === 0}
            onChange={() => setQuantity(0)}
          />
          <span>Custom</span>
        </label>
        {quantity === 0 && (
          <input
            className="custom-votes"
            aria-label="Custom vote quantity"
            type="number"
            min="1"
            max="10000"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        )}
      </fieldset>
      <div className="payment-methods">
        <small>PAYMENT METHOD</small>
        {[
          ['ecocash', 'EcoCash'],
          ['onemoney', 'OneMoney'],
          ['innbucks', 'InnBucks'],
          ['omari', 'OMari'],
        ].map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="method"
              value={value}
              checked={method === value}
              onChange={() => setMethod(value)}
            />
            <span>
              {label}
              <small>Not yet configured</small>
            </span>
          </label>
        ))}
      </div>
      <div className="checkout-total">
        <span>
          {effective} vote{effective === 1 ? '' : 's'} via {method}
        </span>
        <strong>
          {event?.currency ?? 'USD'} {(price * effective).toFixed(2)}
        </strong>
      </div>
      <button type="button" disabled>
        <LockKeyhole size={16} /> Payment setup required
      </button>
      <p className="secure-note">
        The server will calculate the final amount and count votes only after a
        provider callback is verified. Production checkout remains locked until
        authorised merchant credentials are connected.
      </p>
      <Link href={`/contestants/${item.slug}`}>Return to profile</Link>
    </form>
  );
}
