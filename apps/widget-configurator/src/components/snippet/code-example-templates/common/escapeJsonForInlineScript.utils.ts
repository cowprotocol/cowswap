/**
 * Escapes JSON embedded in an HTML `<script>` block so user-controlled values cannot
 * break out via a literal `</script>` substring. HTML tokenization runs before JS parsing.
 */
export function escapeJsonForInlineScript(json: string): string {
  return json.replace(/<\//gi, '\\u003c/')
}
