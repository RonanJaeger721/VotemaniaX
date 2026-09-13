const PUBLIC_HOST = 'votemania-x.vercel.app';

/** Build browser-facing redirects without ever exposing the private app origin. */
export function appUrl(request: Request, path: string) {
  const forwardedHost = request.headers.get('x-forwarded-host')
    ?.split(',')[0]
    ?.trim();
  const requestHost = request.headers.get('host')?.trim();
  const candidateHost = forwardedHost || requestHost || PUBLIC_HOST;
  const isLocal = candidateHost === 'localhost' || candidateHost.startsWith('localhost:');
  const host = isLocal || candidateHost === PUBLIC_HOST ? candidateHost : PUBLIC_HOST;
  const forwardedProtocol = request.headers.get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim();
  const protocol = isLocal ? 'http' : forwardedProtocol === 'http' ? 'http' : 'https';

  return new URL(path, `${protocol}://${host}`);
}
