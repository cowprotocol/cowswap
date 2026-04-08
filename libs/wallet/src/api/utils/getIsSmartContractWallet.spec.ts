import { AccountType } from '@cowprotocol/types'

import { getIsSmartContractWallet } from './getIsSmartContractWallet'

describe('getIsSmartContractWallet', () => {
  it('treats safe wallets as smart contract wallets', () => {
    expect(
      getIsSmartContractWallet({
        accountType: AccountType.EOA,
        capabilities: undefined,
        capabilitiesLoading: false,
        isSafeWallet: true,
        shouldTreatAtomicCapabilitiesAsSmartWallet: true,
      }),
    ).toBe(true)
  })

  it('keeps EIP-7702 accounts as EOAs even with atomic capabilities', () => {
    expect(
      getIsSmartContractWallet({
        accountType: AccountType.EIP7702EOA,
        capabilities: { atomic: { status: 'supported' } },
        capabilitiesLoading: false,
        isSafeWallet: false,
        shouldTreatAtomicCapabilitiesAsSmartWallet: false,
      }),
    ).toBe(false)
  })

  it('uses atomic capabilities while account type is still unknown when the fallback is enabled', () => {
    expect(
      getIsSmartContractWallet({
        accountType: undefined,
        capabilities: { atomic: { status: 'supported' } },
        capabilitiesLoading: false,
        isSafeWallet: false,
        shouldTreatAtomicCapabilitiesAsSmartWallet: true,
      }),
    ).toBe(true)
  })

  it('stays unknown while the account type is still loading when the fallback is disabled', () => {
    expect(
      getIsSmartContractWallet({
        accountType: undefined,
        capabilities: { atomic: { status: 'supported' } },
        capabilitiesLoading: false,
        isSafeWallet: false,
        shouldTreatAtomicCapabilitiesAsSmartWallet: false,
      }),
    ).toBe(undefined)
  })

  it('uses atomic capabilities as a positive signal for resolved EOAs', () => {
    expect(
      getIsSmartContractWallet({
        accountType: AccountType.EOA,
        capabilities: { atomic: { status: 'ready' } },
        capabilitiesLoading: false,
        isSafeWallet: false,
        shouldTreatAtomicCapabilitiesAsSmartWallet: true,
      }),
    ).toBe(true)
  })

  it('returns false for resolved EOAs without smart-wallet capabilities', () => {
    expect(
      getIsSmartContractWallet({
        accountType: AccountType.EOA,
        capabilities: { atomic: { status: 'unsupported' } },
        capabilitiesLoading: false,
        isSafeWallet: false,
        shouldTreatAtomicCapabilitiesAsSmartWallet: true,
      }),
    ).toBe(false)
  })

  it('keeps MetaMask EOAs on the EOA path even if atomic capabilities are exposed', () => {
    expect(
      getIsSmartContractWallet({
        accountType: AccountType.EOA,
        capabilities: { atomic: { status: 'supported' } },
        capabilitiesLoading: false,
        isSafeWallet: false,
        shouldTreatAtomicCapabilitiesAsSmartWallet: false,
      }),
    ).toBe(false)
  })
})
