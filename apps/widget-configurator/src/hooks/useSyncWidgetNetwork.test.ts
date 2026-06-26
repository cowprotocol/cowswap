import { useAvailableChains } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'
import { useConnection, useSwitchChain } from 'wagmi'

import { useSyncWidgetNetwork } from './useSyncWidgetNetwork'

jest.mock('wagmi', () => ({
  useConnection: jest.fn(),
  useSwitchChain: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useAvailableChains: jest.fn(),
}))

const mockedUseConnection = jest.mocked(useConnection)
const mockedUseSwitchChain = jest.mocked(useSwitchChain)
const mockedUseAvailableChains = jest.mocked(useAvailableChains)

const UNSUPPORTED_WALLET_CHAIN_ID = 999

describe('useSyncWidgetNetwork', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseSwitchChain.mockReturnValue({ mutate: jest.fn() } as unknown as ReturnType<typeof useSwitchChain>)
    mockedUseAvailableChains.mockReturnValue([SupportedChainId.MAINNET, SupportedChainId.GNOSIS_CHAIN])
  })

  it('does not mutate configurator chainId when wallet is on an unsupported chain', () => {
    const setNetworkControlState = jest.fn()

    mockedUseConnection.mockReturnValue({
      chainId: UNSUPPORTED_WALLET_CHAIN_ID,
      isConnected: true,
    } as unknown as ReturnType<typeof useConnection>)

    renderHook(() => useSyncWidgetNetwork(SupportedChainId.MAINNET, setNetworkControlState, 'dapp'))

    expect(setNetworkControlState).not.toHaveBeenCalled()
  })

  it('syncs configurator chainId when wallet is on a supported chain', () => {
    const setNetworkControlState = jest.fn()

    mockedUseConnection.mockReturnValue({
      chainId: SupportedChainId.GNOSIS_CHAIN,
      isConnected: true,
    } as unknown as ReturnType<typeof useConnection>)

    renderHook(() => useSyncWidgetNetwork(SupportedChainId.MAINNET, setNetworkControlState, 'dapp'))

    expect(setNetworkControlState).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN)
  })
})
