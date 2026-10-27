import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { OPEN_WALLET_MODAL_EVENT, useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useToggleWalletModal } from './hooks'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  OPEN_WALLET_MODAL_EVENT: 'cowswap-open-wallet-modal',
  useWalletInfo: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

function openModal(chainId: SupportedChainId, isSolanaEnabled: boolean): unknown {
  mockUseWalletInfo.mockReturnValue({ chainId })
  mockUseFlags.mockReturnValue({ isSolanaEnabled })

  let detail: unknown
  const listener = (event: Event): void => {
    detail = (event as CustomEvent).detail
  }
  document.addEventListener(OPEN_WALLET_MODAL_EVENT, listener)
  renderHook(() => useToggleWalletModal()).result.current()
  document.removeEventListener(OPEN_WALLET_MODAL_EVENT, listener)

  return detail
}

describe('useToggleWalletModal', () => {
  it('limits the connect modal to EVM wallets while Solana is off', () => {
    expect(openModal(SupportedChainId.MAINNET, false)).toEqual({ namespace: 'eip155' })
  })

  it('does not filter once Solana is on', () => {
    expect(openModal(SupportedChainId.MAINNET, true)).toEqual({ namespace: undefined })
  })

  it('does not filter on Solana, so direct links can still connect a Solana wallet', () => {
    expect(openModal(SupportedChainId.SOLANA, false)).toEqual({ namespace: undefined })
  })
})
