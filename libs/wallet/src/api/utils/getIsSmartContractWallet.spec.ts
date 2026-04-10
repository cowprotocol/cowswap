import { AccountType } from '@cowprotocol/types'

import { getIsSmartContractWallet } from './getIsSmartContractWallet'

const baseParams = {
  capabilities: undefined,
  capabilitiesLoading: false,
  isSafeWallet: false,
  shouldKeepEoaUnknownWhileCapabilitiesLoad: false,
  shouldTreatAtomicCapabilitiesAsSmartWallet: true,
} as const

describe('getIsSmartContractWallet', () => {
  it('treats safe wallets as smart contract wallets', () => {
    expect(
      getIsSmartContractWallet({
        ...baseParams,
        accountType: AccountType.EOA,
        isSafeWallet: true,
      }),
    ).toBe(true)
  })

  it('keeps EIP-7702 accounts as EOAs even with atomic capabilities', () => {
    expect(
      getIsSmartContractWallet({
        ...baseParams,
        accountType: AccountType.EIP7702EOA,
        capabilities: { atomic: { status: 'supported' } },
        shouldTreatAtomicCapabilitiesAsSmartWallet: false,
      }),
    ).toBe(false)
  })

  it('uses atomic capabilities while account type is still unknown when the fallback is enabled', () => {
    expect(
      getIsSmartContractWallet({
        ...baseParams,
        accountType: undefined,
        capabilities: { atomic: { status: 'supported' } },
      }),
    ).toBe(true)
  })

  it('stays unknown while the account type is still loading when the fallback is disabled', () => {
    expect(
      getIsSmartContractWallet({
        ...baseParams,
        accountType: undefined,
        capabilities: { atomic: { status: 'supported' } },
        shouldTreatAtomicCapabilitiesAsSmartWallet: false,
      }),
    ).toBe(undefined)
  })
})

describe('getIsSmartContractWallet EOA behavior', () => {
  it('uses atomic capabilities as a positive signal for resolved EOAs', () => {
    expect(
      getIsSmartContractWallet({
        ...baseParams,
        accountType: AccountType.EOA,
        capabilities: { atomic: { status: 'ready' } },
      }),
    ).toBe(true)
  })

  it('returns false for resolved EOAs without smart-wallet capabilities', () => {
    expect(
      getIsSmartContractWallet({
        ...baseParams,
        accountType: AccountType.EOA,
        capabilities: { atomic: { status: 'unsupported' } },
      }),
    ).toBe(false)
  })

  it('keeps resolved EOAs on the EOA path while capabilities are still loading', () => {
    expect(
      getIsSmartContractWallet({
        ...baseParams,
        accountType: AccountType.EOA,
        capabilitiesLoading: true,
      }),
    ).toBe(false)
  })

  it('keeps Coinbase EOAs unknown while smart-wallet capabilities are still loading', () => {
    expect(
      getIsSmartContractWallet({
        ...baseParams,
        accountType: AccountType.EOA,
        capabilitiesLoading: true,
        shouldKeepEoaUnknownWhileCapabilitiesLoad: true,
      }),
    ).toBe(undefined)
  })

  it('keeps MetaMask EOAs on the EOA path even if atomic capabilities are exposed', () => {
    expect(
      getIsSmartContractWallet({
        ...baseParams,
        accountType: AccountType.EOA,
        capabilities: { atomic: { status: 'supported' } },
        shouldTreatAtomicCapabilitiesAsSmartWallet: false,
      }),
    ).toBe(false)
  })
})
