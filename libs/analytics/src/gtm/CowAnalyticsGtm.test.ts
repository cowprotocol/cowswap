import { CowAnalyticsGtm } from './CowAnalyticsGtm'

import { AnalyticsContext } from '../CowAnalytics'

type DataLayerEntry = Record<string, unknown>

function getLastEvent(eventName: string): DataLayerEntry | undefined {
  const dataLayer = window.dataLayer as DataLayerEntry[]

  return [...dataLayer].reverse().find((entry) => entry.event === eventName)
}

describe('CowAnalyticsGtm wallet lifecycle events', () => {
  let analytics: CowAnalyticsGtm

  beforeEach(() => {
    window.dataLayer = []
    window.cowAnalyticsInstance = undefined
    analytics = new CowAnalyticsGtm()
    analytics.setContext(AnalyticsContext.chainId, '1')
  })

  afterEach(() => {
    analytics.destroy()
    window.cowAnalyticsInstance = undefined
    window.dataLayer = []
  })

  it('tracks wallet_connected with current wallet dimensions', () => {
    analytics.setUserAccount('0x1111111111111111111111111111111111111111', 'Rainbow')

    expect(getLastEvent('wallet_connected')).toMatchObject({
      event: 'wallet_connected',
      walletAddress: '0x1111111111111111111111111111111111111111',
      walletName: 'Rainbow',
      dimension_chainId: '1',
      dimension_userAddress: '0x1111111111111111111111111111111111111111',
      dimension_walletName: 'Rainbow',
    })
  })

  it('tracks wallet_switched with previous and current wallet names', () => {
    analytics.setUserAccount('0x1111111111111111111111111111111111111111', 'Rainbow')
    analytics.setUserAccount('0x2222222222222222222222222222222222222222', 'MetaMask')

    expect(getLastEvent('wallet_switched')).toMatchObject({
      event: 'wallet_switched',
      previousWalletAddress: '0x1111111111111111111111111111111111111111',
      previousWalletName: 'Rainbow',
      walletAddress: '0x2222222222222222222222222222222222222222',
      walletName: 'MetaMask',
      dimension_chainId: '1',
      dimension_userAddress: '0x2222222222222222222222222222222222222222',
      dimension_walletName: 'MetaMask',
    })
  })

  it('tracks wallet_disconnected with previous wallet context before clearing it', () => {
    analytics.setUserAccount('0x1111111111111111111111111111111111111111', 'Rainbow')
    analytics.setUserAccount(undefined)

    expect(getLastEvent('wallet_disconnected')).toMatchObject({
      event: 'wallet_disconnected',
      previousWalletAddress: '0x1111111111111111111111111111111111111111',
      previousWalletName: 'Rainbow',
      dimension_chainId: '1',
      dimension_userAddress: 'disconnected',
      dimension_walletName: 'Rainbow',
    })
  })

  it('does not leak previous wallet name into a new connection after disconnect', () => {
    analytics.setUserAccount('0x1111111111111111111111111111111111111111', 'Rainbow')
    analytics.setUserAccount(undefined)
    analytics.setUserAccount('0x3333333333333333333333333333333333333333', 'Rabby')

    expect(getLastEvent('wallet_connected')).toMatchObject({
      event: 'wallet_connected',
      walletAddress: '0x3333333333333333333333333333333333333333',
      walletName: 'Rabby',
      dimension_walletName: 'Rabby',
      dimension_userAddress: '0x3333333333333333333333333333333333333333',
    })
  })
})
