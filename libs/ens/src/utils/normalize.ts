import { normalize as viemNormalize } from 'viem/ens'

export function normalize(value: string | null | undefined): string {
  const safeValue = value || ''
  const safeToNormalize =
    safeValue.length > 0 && !safeValue.startsWith('.') && !safeValue.endsWith('.') && !safeValue.includes('..')

  return safeToNormalize ? viemNormalize(safeValue) : ''
}
