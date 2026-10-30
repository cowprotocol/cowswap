import { selectWaitAndSaveStrip } from './selectWaitAndSaveStrip.utils'

import type { PositiveAloneGain, WaitAndSaveCompetitionDerivation } from './deriveWaitAndSaveCompetition.utils'

const GAIN: PositiveAloneGain = {
  bestAloneBuyAmount: 100n,
  gainAmount: 5n,
  gainPercent: 5,
  winningBuyAmount: 105n,
}

function derivation(partial: Partial<WaitAndSaveCompetitionDerivation> = {}): WaitAndSaveCompetitionDerivation {
  return {
    companionCount: undefined,
    hasAloneBid: false,
    positiveGain: undefined,
    solvers: [],
    ...partial,
  }
}

describe('selectWaitAndSaveStrip', () => {
  it('uses the CoW label when the winning buy beats the best alone bid', () => {
    expect(selectWaitAndSaveStrip(derivation({ companionCount: 2, hasAloneBid: true, positiveGain: GAIN }))).toEqual({
      hasAloneBid: true,
      kind: 'cow',
    })
  })

  it('counts the other orders when the batch has no positive gain', () => {
    expect(selectWaitAndSaveStrip(derivation({ companionCount: 1, hasAloneBid: false }))).toEqual({
      companionCount: 1,
      hasAloneBid: false,
      kind: 'batched',
    })
  })

  it('keeps the alone-bid flag when a solo offer was not better', () => {
    expect(selectWaitAndSaveStrip(derivation({ companionCount: 4, hasAloneBid: true }))).toEqual({
      companionCount: 4,
      hasAloneBid: true,
      kind: 'batched',
    })
  })

  it('says the order joined the batch when the winning solution is only that order', () => {
    expect(selectWaitAndSaveStrip(derivation({ companionCount: 0, hasAloneBid: true }))).toEqual({
      hasAloneBid: true,
      kind: 'joined',
    })
  })

  it('falls back to joined without an auction claim when the lookup produced nothing', () => {
    expect(selectWaitAndSaveStrip(undefined)).toEqual({
      comparisonUnavailable: true,
      hasAloneBid: false,
      kind: 'joined',
    })
    expect(selectWaitAndSaveStrip(derivation())).toEqual({
      comparisonUnavailable: true,
      hasAloneBid: false,
      kind: 'joined',
    })
  })
})
