import Image from 'next/image';

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function ContestantAvatar({
  name,
  photoUrl,
  priority = false,
}: {
  name: string;
  photoUrl?: string | null;
  priority?: boolean;
}) {
  return (
    <span className="contestant-avatar" aria-label={`${name} profile image`}>
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          priority={priority}
          sizes="(max-width: 700px) 92vw, 520px"
        />
      ) : (
        <strong aria-hidden="true">{initials(name)}</strong>
      )}
    </span>
  );
}
