import {
  EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS,
  getEoaTwapPrePlacementAmountToCover,
} from './getEoaTwapPrePlacementAmountToCover'

describe('getEoaTwapPrePlacementAmountToCover()', () => {
  it('adds the funding allowance buffer in bps', () => {
    const sellAmountAtoms = 1_000_000n

    expect(getEoaTwapPrePlacementAmountToCover(sellAmountAtoms)).toBe(
      sellAmountAtoms + (sellAmountAtoms * EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS) / 10000n,
    )
  })

  it('returns sell amount unchanged when sell is zero', () => {
    expect(getEoaTwapPrePlacementAmountToCover(0n)).toBe(0n)
  })
})
