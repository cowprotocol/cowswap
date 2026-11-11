import { useSolanaWalletName } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useWalletAcceptsForeignFeePayer } from './useWalletAcceptsForeignFeePayer'

jest.mock('@cowprotocol/wallet', () => ({ useSolanaWalletName: jest.fn() }))

const mockUseSolanaWalletName = jest.mocked(useSolanaWalletName)

function render(walletName: string | undefined): boolean {
  mockUseSolanaWalletName.mockReturnValue(walletName)

  return renderHook(() => useWalletAcceptsForeignFeePayer()).result.current
}

describe('useWalletAcceptsForeignFeePayer', () => {
  it.each(['Ledger Live', 'Ledger', 'ledger live'])('rejects a foreign fee payer for %s', (walletName) => {
    expect(render(walletName)).toBe(false)
  })

  // The same Ledger account signs a sponsored transaction fine once imported into another wallet,
  // so the peer name is what decides, not the device.
  it.each(['Phantom', 'Solflare', 'Backpack'])('accepts a foreign fee payer for %s', (walletName) => {
    expect(render(walletName)).toBe(true)
  })

  it('accepts a foreign fee payer while no Solana wallet is connected', () => {
    expect(render(undefined)).toBe(true)
  })

  it('accepts a foreign fee payer when the wallet reports an empty name', () => {
    expect(render('')).toBe(true)
  })
})
