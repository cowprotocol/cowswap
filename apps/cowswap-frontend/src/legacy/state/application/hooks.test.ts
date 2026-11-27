import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { OPEN_WALLET_MODAL_EVENT, useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useToggleWalletModal } from './hooks'

jest.mock('@cowprotocol/wallet', () => ({
  OPEN_WALLET_MODAL_EVENT: 'cowswap-open-wallet-modal',
  useWalletInfo: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

function openModal(chainId: SupportedChainId): unknown {
  mockUseWalletInfo.mockReturnValue({ chainId })

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
  afterEach(() => {
    window.location.hash = ''
  })

  it('does not filter the connect modal where Solana is available', () => {
    expect(openModal(SupportedChainId.MAINNET)).toEqual({ namespace: undefined })
  })

  it('limits the connect modal to EVM wallets inside the widget', () => {
    window.location.hash = '#/1/widget/swap'

    expect(openModal(SupportedChainId.MAINNET)).toEqual({ namespace: 'eip155' })
  })

  it('does not filter on Solana, so direct links can still connect a Solana wallet', () => {
    window.location.hash = '#/1/widget/swap'

    expect(openModal(SupportedChainId.SOLANA)).toEqual({ namespace: undefined })
  })
})
