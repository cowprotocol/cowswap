import { createStore, Provider } from 'jotai'
import { createElement, ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { OPEN_WALLET_MODAL_EVENT, useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { alphaNetworksEnabledAtom } from 'entities/alphaNetworks'

import { useToggleWalletModal } from './hooks'

jest.mock('@cowprotocol/wallet', () => ({
  OPEN_WALLET_MODAL_EVENT: 'cowswap-open-wallet-modal',
  useWalletInfo: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

function openModal(chainId: SupportedChainId, areAlphaNetworksEnabled: boolean): unknown {
  mockUseWalletInfo.mockReturnValue({ chainId })
  const store = createStore()
  store.set(alphaNetworksEnabledAtom, areAlphaNetworksEnabled)
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)

  let detail: unknown
  const listener = (event: Event): void => {
    detail = (event as CustomEvent).detail
  }
  document.addEventListener(OPEN_WALLET_MODAL_EVENT, listener)
  renderHook(() => useToggleWalletModal(), { wrapper }).result.current()
  document.removeEventListener(OPEN_WALLET_MODAL_EVENT, listener)

  return detail
}

describe('useToggleWalletModal', () => {
  it('limits the connect modal to EVM wallets while alpha networks are off', () => {
    expect(openModal(SupportedChainId.MAINNET, false)).toEqual({ namespace: 'eip155' })
  })

  it('does not filter once alpha networks are on', () => {
    expect(openModal(SupportedChainId.MAINNET, true)).toEqual({ namespace: undefined })
  })

  it('does not filter on Solana, so direct links can still connect a Solana wallet', () => {
    expect(openModal(SupportedChainId.SOLANA, false)).toEqual({ namespace: undefined })
  })
})
