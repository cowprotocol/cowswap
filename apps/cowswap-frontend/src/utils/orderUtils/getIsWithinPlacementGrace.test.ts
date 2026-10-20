import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getIsWithinPlacementGrace } from './getIsWithinPlacementGrace'

const NOW = 1_700_000_000_000
const SOLANA = SupportedChainId.SOLANA
const MAINNET = SupportedChainId.MAINNET

function placedAgo(ms: number): { creationTime: string } {
  return { creationTime: new Date(NOW - ms).toISOString() }
}

describe('getIsWithinPlacementGrace', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('holds for an order placed moments ago', () => {
    expect(getIsWithinPlacementGrace(SOLANA, placedAgo(2_000))).toBe(true)
  })

  it('lapses once the window has passed', () => {
    expect(getIsWithinPlacementGrace(SOLANA, placedAgo(11_000))).toBe(false)
  })

  // The funding checks have to come back on their own, or a genuinely unfillable order stays silent.
  it('lapses exactly at the boundary rather than hanging on', () => {
    expect(getIsWithinPlacementGrace(SOLANA, placedAgo(10_000))).toBe(false)
  })

  // A sponsored order's funding is deferred to settlement, not carried by a placement transaction, so
  // there is no window to wait out — its existing carve-out covers it.
  it('does not apply to a sponsored order', () => {
    expect(getIsWithinPlacementGrace(SOLANA, { ...placedAgo(2_000), isSponsored: true })).toBe(false)
  })

  // On EVM the sell funds and the approval exist before the order is placed, so the snapshot is already
  // right and a blind window would only hide a real shortfall.
  it('does not apply off Solana', () => {
    expect(getIsWithinPlacementGrace(MAINNET, placedAgo(2_000))).toBe(false)
  })

  it('accepts a Date as well as an ISO string', () => {
    expect(getIsWithinPlacementGrace(SOLANA, { creationTime: new Date(NOW - 2_000) })).toBe(true)
  })

  it('does not apply when the order carries no creation time', () => {
    expect(getIsWithinPlacementGrace(SOLANA, {})).toBe(false)
  })

  it('does not apply when the creation time is unparseable', () => {
    expect(getIsWithinPlacementGrace(SOLANA, { creationTime: 'not-a-date' })).toBe(false)
  })
})
