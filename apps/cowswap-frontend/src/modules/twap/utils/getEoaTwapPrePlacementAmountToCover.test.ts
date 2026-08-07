import {
  EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS,
  getEoaTwapPrePlacementAmountToCover,
  getEoaTwapSetupFeeEstimateAtoms,
} from './getEoaTwapPrePlacementAmountToCover'

describe('getEoaTwapPrePlacementAmountToCover()', () => {
  it('adds the funding allowance buffer in bps on the setup fee estimate', () => {
    const setupFeeEstimateAtoms = 1_000_000n

    expect(getEoaTwapPrePlacementAmountToCover(setupFeeEstimateAtoms)).toBe(
      setupFeeEstimateAtoms + (setupFeeEstimateAtoms * EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS) / 10000n,
    )
  })

  it('returns zero when the fee estimate is zero', () => {
    expect(getEoaTwapPrePlacementAmountToCover(0n)).toBe(0n)
  })
})

describe('getEoaTwapSetupFeeEstimateAtoms()', () => {
  it('returns ~0.05 of an 18-decimal token', () => {
    expect(getEoaTwapSetupFeeEstimateAtoms(18)).toBe(5n * 10n ** 16n)
  })

  it('returns 5 atoms when decimals are at most 2', () => {
    expect(getEoaTwapSetupFeeEstimateAtoms(2)).toBe(5n)
    expect(getEoaTwapSetupFeeEstimateAtoms(0)).toBe(5n)
  })
})
