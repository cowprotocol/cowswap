import { useConnection } from 'wagmi'

import { render } from '@testing-library/react'

import { Analytics } from './Analytics'

jest.mock('wagmi', () => ({ useConnection: jest.fn() }))
jest.mock('next/navigation', () => ({ usePathname: () => '/rwa' }))

const ADDRESS = '0x1111111111111111111111111111111111111111'
const OTHER_ADDRESS = '0x2222222222222222222222222222222222222222'

type Connection = ReturnType<typeof useConnection>

function mockConnection(address: string | undefined): void {
  jest.mocked(useConnection).mockReturnValue({
    address,
    chainId: address ? 1 : undefined,
    connector: address ? { name: 'MetaMask' } : undefined,
    status: address ? 'connected' : 'disconnected',
  } as unknown as Connection)
}

function walletEvents(): object[] {
  return (window.dataLayer ?? []).filter(
    (entry) => 'event' in entry && String(entry.event).match(/^(set_user_account|wallet_)/),
  )
}

describe('Analytics wallet events', () => {
  beforeEach(() => {
    window.dataLayer = []
  })

  it('sends the CoW Swap wallet events and user account', () => {
    mockConnection(ADDRESS)
    const { rerender } = render(<Analytics />)

    mockConnection(OTHER_ADDRESS)
    rerender(<Analytics />)

    mockConnection(undefined)
    rerender(<Analytics />)

    expect(walletEvents()).toEqual([
      expect.objectContaining({ event: 'set_user_account', userId: ADDRESS }),
      expect.objectContaining({
        event: 'wallet_connected',
        eventType: 'wallet_initial_connection',
        walletAddress: ADDRESS,
        walletName: 'MetaMask',
        dimension_walletName: 'MetaMask',
      }),
      expect.objectContaining({ event: 'set_user_account', userId: OTHER_ADDRESS }),
      expect.objectContaining({
        event: 'wallet_switched',
        eventType: 'wallet_switch',
        walletAddress: OTHER_ADDRESS,
        previousWalletAddress: ADDRESS,
      }),
      { event: 'set_user_account', dimension_userAddress: 'disconnected', dimension_walletName: 'MetaMask' },
      expect.objectContaining({
        event: 'wallet_disconnected',
        eventType: 'wallet_disconnection',
        previousWalletAddress: OTHER_ADDRESS,
        previousWalletName: 'MetaMask',
        dimension_walletName: 'MetaMask',
      }),
    ])
  })
})
