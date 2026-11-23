/**
 * The class site moves to ustadbillu.vercel.app/class: the main Billu site
 * forwards /class/* to this project. Flip BASE_PATH to "/class" once that
 * forward (vercel.json rewrite in ustadbillu-site) is live; everything else
 * (Next basePath, redirects from cheatjs.vercel.app, canonical URLs, icons,
 * manifest, service worker) follows this one value.
 */
export const BASE_PATH: string = "/class";

export const PUBLIC_ORIGIN = BASE_PATH ? "https://ustadbillu.vercel.app" : "https://cheatjs.vercel.app";

export function withBase(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith(BASE_PATH + "/") || path === BASE_PATH) return path;
  return path === "/" ? BASE_PATH : `${BASE_PATH}${path}`;
}
