import { AccountType } from '@cowprotocol/types'

import { shouldRestrictStandardBridgeProviders } from './BridgeProvidersUpdater.utils'

describe('shouldRestrictStandardBridgeProviders', () => {
  it('restricts standard bridge providers for smart contract wallets', () => {
    expect(
      shouldRestrictStandardBridgeProviders({
        accountType: AccountType.SMART_CONTRACT,
        isSmartContractWallet: true,
      }),
    ).toBe(true)
  })

  it('restricts standard bridge providers for EIP-7702 accounts', () => {
    expect(
      shouldRestrictStandardBridgeProviders({
        accountType: AccountType.EIP7702EOA,
        isSmartContractWallet: false,
      }),
    ).toBe(true)
  })

  it('keeps standard bridge providers for resolved EOAs', () => {
    expect(
      shouldRestrictStandardBridgeProviders({
        accountType: AccountType.EOA,
        isSmartContractWallet: false,
      }),
    ).toBe(false)
  })

  it('does not restrict standard bridge providers while detection is still unknown', () => {
    expect(
      shouldRestrictStandardBridgeProviders({
        accountType: undefined,
        isSmartContractWallet: undefined,
      }),
    ).toBe(false)
  })
})
