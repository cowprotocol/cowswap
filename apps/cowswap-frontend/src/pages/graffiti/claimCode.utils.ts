/**
 * A claim code, from what someone pasted into the box.
 *
 * QR codes encode the whole claim URL, so a phone that scanned one and a laptop
 * that was handed the link both paste a URL rather than the bare code.
 */
export function parseClaimCode(input: string): string {
  const trimmed = input.trim()

  if (!trimmed) return ''

  return codeFromQuery(trimmed) ?? trimmed
}

function codeFromQuery(input: string): string | null {
  // The claim URL is a hash route, so the query it carries is not the one
  // `new URL()` parses: read the last query string in the text instead.
  const queryStart = input.lastIndexOf('?')

  if (queryStart === -1) return null

  const code = new URLSearchParams(input.slice(queryStart + 1)).get('code')

  return code?.trim() || null
}
