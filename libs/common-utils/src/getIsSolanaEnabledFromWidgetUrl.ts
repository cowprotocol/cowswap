/**
 * Resolved by `widget-lib` from the partner's params and carried in the iframe URL, because the
 * wallet config decides which Reown adapters to create at module load — long before the params
 * themselves arrive over postMessage.
 */
export function getIsSolanaEnabledFromWidgetUrl(): boolean {
  if (typeof window === 'undefined') return false

  const hashSearch = window.location.hash.split('?')[1]

  if (!hashSearch) return false

  return new URLSearchParams(hashSearch).get('solanaEnabled') === 'true'
}
