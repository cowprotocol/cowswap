import { act, renderHook } from '@testing-library/react'
import { useConnection } from 'wagmi'

import {
  useIsAssetWatchingSupported,
  useIsBraveWallet,
  useIsMetamaskBrowserExtensionWallet,
  useIsRabbyWallet,
} from './hooks'
import { ConnectionType } from './types'

import { reownAppKit } from '../wagmi/config'

type WalletInfoState = { name: string; icon?: string } | null
type WalletInfoListener = (state: WalletInfoState) => void

jest.mock('wagmi', () => ({
  useCapabilities: jest.fn(),
  useConnection: jest.fn(),
  usePublicClient: jest.fn(),
}))

jest.mock('../wagmi/config', () => ({
  reownAppKit: { subscribeWalletInfo: jest.fn() },
}))

const useConnectionMock = useConnection as jest.Mock
const subscribeWalletInfoMock = reownAppKit.subscribeWalletInfo as jest.Mock

const genericInjectedConnector = {
  id: 'injected',
  name: 'Injected',
  type: ConnectionType.INJECTED,
}

let walletInfoListeners: WalletInfoListener[] = []

function emitWalletInfo(name: string): void {
  act(() => {
    walletInfoListeners.forEach((listener) => listener({ name, icon: 'wallet-icon' }))
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  walletInfoListeners = []

  Object.defineProperty(window, 'ethereum', {
    configurable: true,
    value: undefined,
  })

  useConnectionMock.mockReturnValue({ connector: genericInjectedConnector })
  subscribeWalletInfoMock.mockImplementation((listener: WalletInfoListener) => {
    walletInfoListeners.push(listener)

    return jest.fn()
  })
})

describe('wallet identity hooks', () => {
  it('uses AppKit metadata for generic injected Rabby feature gates', () => {
    const { result } = renderHook(() => ({
      isRabbyWallet: useIsRabbyWallet(),
      isAssetWatchingSupported: useIsAssetWatchingSupported(),
    }))

    expect(result.current).toEqual({
      isRabbyWallet: false,
      isAssetWatchingSupported: false,
    })

    emitWalletInfo('Rabby Wallet')

    expect(result.current).toEqual({
      isRabbyWallet: true,
      isAssetWatchingSupported: true,
    })
  })

  it('uses AppKit metadata for generic injected Brave feature gates', () => {
    const { result } = renderHook(() => ({
      isBraveWallet: useIsBraveWallet(),
      isAssetWatchingSupported: useIsAssetWatchingSupported(),
    }))

    expect(result.current).toEqual({
      isBraveWallet: false,
      isAssetWatchingSupported: false,
    })

    emitWalletInfo('Brave Wallet')

    expect(result.current).toEqual({
      isBraveWallet: true,
      isAssetWatchingSupported: true,
    })
  })

  it('uses AppKit metadata for the generic injected MetaMask signing gate', () => {
    const { result } = renderHook(() => useIsMetamaskBrowserExtensionWallet())

    expect(result.current).toBe(false)

    emitWalletInfo('MetaMask')

    expect(result.current).toBe(true)
  })
})
