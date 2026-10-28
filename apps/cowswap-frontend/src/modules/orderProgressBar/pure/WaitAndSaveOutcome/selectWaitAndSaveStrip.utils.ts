import type { WaitAndSaveCompetitionDerivation } from './deriveWaitAndSaveCompetition.utils'

export type WaitAndSaveStrip =
  | { hasAloneBid: true; kind: 'cow' }
  | { companionCount: number; hasAloneBid: boolean; kind: 'batched' }
  | { comparisonUnavailable?: boolean; hasAloneBid: boolean; kind: 'joined' }

export function selectWaitAndSaveStrip(derivation: WaitAndSaveCompetitionDerivation | undefined): WaitAndSaveStrip {
  if (derivation?.positiveGain) {
    return { hasAloneBid: true, kind: 'cow' }
  }

  if (derivation?.companionCount === undefined) {
    return { comparisonUnavailable: true, hasAloneBid: false, kind: 'joined' }
  }

  if (derivation.companionCount > 0) {
    return {
      companionCount: derivation.companionCount,
      hasAloneBid: derivation.hasAloneBid,
      kind: 'batched',
    }
  }

  return { hasAloneBid: derivation.hasAloneBid, kind: 'joined' }
}
