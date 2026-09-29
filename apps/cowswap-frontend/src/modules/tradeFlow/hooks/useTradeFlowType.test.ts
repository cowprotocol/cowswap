import { getFlowType } from './useTradeFlowType'

import { FlowType } from '../types/TradeFlowContext'

describe('getFlowType', () => {
  it('returns SOLANA_SWAP when on a Solana chain, regardless of other flags', () => {
    expect(getFlowType(true, true, true, true, true)).toBe(FlowType.SOLANA_SWAP)
    expect(getFlowType(true, false, false, false, false)).toBe(FlowType.SOLANA_SWAP)
  })

  it('returns EOA_ETH_FLOW when not on Solana and isEoaEthFlow is true', () => {
    expect(getFlowType(false, true, true, true, true)).toBe(FlowType.EOA_ETH_FLOW)
  })

  it('returns SAFE_BUNDLE_ETH when not on Solana, not EOA eth flow, and isSafeEthFlow is true', () => {
    expect(getFlowType(false, true, false, true, true)).toBe(FlowType.SAFE_BUNDLE_ETH)
  })

  it('returns SAFE_BUNDLE_APPROVAL when isSafeBundle is true and permit is not required', () => {
    expect(getFlowType(false, true, false, false, false)).toBe(FlowType.SAFE_BUNDLE_APPROVAL)
  })

  it('returns REGULAR when none of the special flows apply', () => {
    expect(getFlowType(false, false, false, false, false)).toBe(FlowType.REGULAR)
    expect(getFlowType(false, true, false, false, true)).toBe(FlowType.REGULAR) // isSafeBundle but permit required
  })
})
