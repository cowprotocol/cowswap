/**
 * The app is served under `https://swap.cow.fi/rwa`, on the CoW Swap origin, so both apps share localStorage
 * and the wallet connection. Next.js prefixes `Link`, router and metadata URLs with it, but not `fetch`,
 * `next/image` `src` or service worker URLs.
 */
export const BASE_PATH = '/rwa'

/** `path` starts with `/` */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`
}
