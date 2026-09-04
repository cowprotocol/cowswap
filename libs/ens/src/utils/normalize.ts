import { normalize as viemNormalize } from 'viem/ens'

export function normalizeEnsName(value: string | null | undefined): string {
  const safeValue = value || ''
  // ENS names always contain at least one label separator (e.g. "vitalik.eth").
  // Without this check, any dot-less garbage string (raw address, random text) gets sent
  // through ENS normalization and a live on-chain resolution lookup for no reason.
  const safeToNormalize =
    safeValue.length > 0 &&
    safeValue.includes('.') &&
    !safeValue.startsWith('.') &&
    !safeValue.endsWith('.') &&
    !safeValue.includes('..')

  if (!safeToNormalize) return ''

  try {
    return viemNormalize(safeValue)
  } catch {
    return ''
  }
}
