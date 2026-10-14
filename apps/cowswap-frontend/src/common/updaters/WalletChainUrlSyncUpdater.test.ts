import { useConnection } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSolanaWalletProvider } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useLegacySetChainIdToUrl } from 'common/hooks/useLegacySetChainIdToUrl'

import { WalletChainUrlSyncUpdater } from './WalletChainUrlSyncUpdater'

jest.mock('wagmi', () => ({
  useConnection: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useSolanaWalletProvider: jest.fn(),
}))

jest.mock('common/hooks/useLegacySetChainIdToUrl', () => ({
  useLegacySetChainIdToUrl: jest.fn(),
}))

const mockedUseConnection = useConnection as jest.MockedFunction<typeof useConnection>
const mockedUseSolanaWalletProvider = useSolanaWalletProvider as jest.MockedFunction<typeof useSolanaWalletProvider>
const mockedUseLegacySetChainIdToUrl = useLegacySetChainIdToUrl as jest.MockedFunction<typeof useLegacySetChainIdToUrl>

const solanaProvider = {} as ReturnType<typeof useSolanaWalletProvider>

function mockConnection(isConnected: boolean, chainId: number | undefined): void {
  mockedUseConnection.mockReturnValue({ isConnected, chainId } as unknown as ReturnType<typeof useConnection>)
}

describe('WalletChainUrlSyncUpdater', () => {
  let setChainIdToUrl: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    setChainIdToUrl = jest.fn()
    mockedUseLegacySetChainIdToUrl.mockReturnValue(setChainIdToUrl)
    mockedUseSolanaWalletProvider.mockReturnValue(undefined)
    mockConnection(false, undefined)
  })

  it('does not sync the EVM chain to URL when a Solana wallet is connected', () => {
    mockedUseSolanaWalletProvider.mockReturnValue(solanaProvider)

    const { rerender } = renderHook(() => WalletChainUrlSyncUpdater())

    mockConnection(true, SupportedChainId.MAINNET)
    rerender()

    mockConnection(true, SupportedChainId.BASE)
    rerender()

    expect(setChainIdToUrl).not.toHaveBeenCalled()
  })

  it('syncs the chain to URL when an EVM wallet connects', () => {
    const { rerender } = renderHook(() => WalletChainUrlSyncUpdater())

    mockConnection(true, SupportedChainId.MAINNET)
    rerender()

    expect(setChainIdToUrl).toHaveBeenCalledTimes(1)
    expect(setChainIdToUrl).toHaveBeenCalledWith(SupportedChainId.MAINNET)
  })

  it('syncs the chain to URL when an EVM wallet changes chain', () => {
    mockConnection(true, SupportedChainId.MAINNET)

    const { rerender } = renderHook(() => WalletChainUrlSyncUpdater())

    expect(setChainIdToUrl).not.toHaveBeenCalled()

    mockConnection(true, SupportedChainId.BASE)
    rerender()

    expect(setChainIdToUrl).toHaveBeenCalledTimes(1)
    expect(setChainIdToUrl).toHaveBeenCalledWith(SupportedChainId.BASE)
  })
})
