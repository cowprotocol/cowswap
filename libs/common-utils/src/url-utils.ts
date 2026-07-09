/**
 * Removes a single trailing slash from the URL, leaving the rest of the path
 * untouched. Safe to call on already-trimmed URLs.
 */
export function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}
