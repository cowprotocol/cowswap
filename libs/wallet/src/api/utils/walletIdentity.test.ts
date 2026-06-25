import { getWalletDisplayName, getWalletRdns } from './walletIdentity'

import { BRAVE_WALLET_RDNS, METAMASK_RDNS, RABBY_RDNS } from '../../constants'
import { ConnectionType } from '../types'

describe('walletIdentity', () => {
  it('uses the connector rdns when it is already wallet-specific', () => {
    expect(getWalletRdns({ connector: { id: RABBY_RDNS, name: 'Rabby Wallet' } })).toBe(RABBY_RDNS)
  })

  it('detects Rabby behind the generic injected connector', () => {
    const provider = { isMetaMask: true, isRabby: true }

    expect(
      getWalletRdns({ connector: { id: 'injected', name: 'Injected', type: ConnectionType.INJECTED }, provider }),
    ).toBe(RABBY_RDNS)
  })

  it('detects MetaMask behind the generic injected connector', () => {
    const provider = { isMetaMask: true }

    expect(
      getWalletRdns({ connector: { id: 'injected', name: 'Injected', type: ConnectionType.INJECTED }, provider }),
    ).toBe(METAMASK_RDNS)
  })

  it('detects Brave Wallet from wallet metadata without reading provider flags', () => {
    expect(
      getWalletRdns({
        connector: { id: 'injected', name: 'Injected', type: ConnectionType.INJECTED },
        walletName: 'Brave Wallet',
      }),
    ).toBe(BRAVE_WALLET_RDNS)
  })

  it('does not use injected provider flags for non-injected connectors', () => {
    const provider = { isMetaMask: true }

    expect(
      getWalletRdns({
        connector: { id: 'walletConnect', name: 'WalletConnect', type: ConnectionType.WALLET_CONNECT_V2 },
        provider,
      }),
    ).toBeUndefined()
  })

  it('uses a wallet-specific display name for a generic injected connector', () => {
    const provider = { isRabby: true }

    expect(
      getWalletDisplayName({
        connector: { id: 'injected', name: 'Injected', type: ConnectionType.INJECTED },
        provider,
      }),
    ).toBe('Rabby Wallet')
  })

  it('ignores throwing provider flags', () => {
    const provider = {}

    Object.defineProperty(provider, 'isMetaMask', {
      get() {
        throw new Error('provider unavailable')
      },
    })

    expect(
      getWalletRdns({ connector: { id: 'injected', name: 'Injected', type: ConnectionType.INJECTED }, provider }),
    ).toBeUndefined()
  })
})
