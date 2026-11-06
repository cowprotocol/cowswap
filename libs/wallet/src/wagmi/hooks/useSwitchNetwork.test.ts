import { useConnection } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { solana } from '@reown/appkit/networks'
import { renderHook } from '@testing-library/react'

import { useSwitchNetwork } from './useSwitchNetwork'

import { reownAppKit } from '../config'

jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual('@cowprotocol/common-const'),
  IS_SOLANA_ENABLED: true,
}))

jest.mock('@reown/appkit/networks', () => ({
  solana: { id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', chainNamespace: 'solana' },
}))

jest.mock('wagmi', () => ({
  useConnection: jest.fn(),
}))

jest.mock('../config', () => ({
  reownAppKit: { switchNetwork: jest.fn(), getActiveChainNamespace: jest.fn(), getCaipNetwork: jest.fn() },
}))

const useConnectionMock = useConnection as jest.Mock
const switchNetworkMock = reownAppKit.switchNetwork as jest.Mock
const getActiveChainNamespaceMock = reownAppKit.getActiveChainNamespace as jest.Mock
const getCaipNetworkMock = reownAppKit.getCaipNetwork as jest.Mock

describe('useSwitchNetwork', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useConnectionMock.mockReturnValue({ isConnected: true })
    getActiveChainNamespaceMock.mockReturnValue('eip155')
  })

  it('switches to Solana when wagmi is connected through a multi-namespace WalletConnect session', async () => {
    const { result } = renderHook(() => useSwitchNetwork())

    await result.current(SupportedChainId.SOLANA)

    expect(switchNetworkMock).toHaveBeenCalledWith(solana, { throwOnFailure: true })
  })

  it('switches to an EVM network', async () => {
    const { result } = renderHook(() => useSwitchNetwork())

    await result.current(SupportedChainId.GNOSIS_CHAIN)

    expect(switchNetworkMock).toHaveBeenCalledWith(expect.objectContaining({ id: SupportedChainId.GNOSIS_CHAIN }), {
      throwOnFailure: true,
    })
  })

  it('asks the wallet to switch its EVM chain after activating the eip155 namespace from Solana', async () => {
    getActiveChainNamespaceMock.mockReturnValue('solana')
    const { result } = renderHook(() => useSwitchNetwork())

    await result.current(SupportedChainId.GNOSIS_CHAIN)

    expect(switchNetworkMock).toHaveBeenCalledTimes(2)
    expect(switchNetworkMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: SupportedChainId.GNOSIS_CHAIN }),
      {
        throwOnFailure: true,
      },
    )
  })

  it('switches only once within the same namespace', async () => {
    const { result } = renderHook(() => useSwitchNetwork())

    await result.current(SupportedChainId.GNOSIS_CHAIN)

    expect(switchNetworkMock).toHaveBeenCalledTimes(1)
  })

  it('switches AppKit back to the previous network when the wallet rejects the EVM chain switch', async () => {
    const rejection = new Error('User rejected the request')
    getActiveChainNamespaceMock.mockReturnValue('solana')
    getCaipNetworkMock.mockReturnValue(solana)
    switchNetworkMock.mockResolvedValueOnce(undefined).mockRejectedValueOnce(rejection)
    const { result } = renderHook(() => useSwitchNetwork())

    await expect(result.current(SupportedChainId.GNOSIS_CHAIN)).rejects.toBe(rejection)

    expect(switchNetworkMock).toHaveBeenCalledTimes(3)
    expect(switchNetworkMock).toHaveBeenLastCalledWith(solana)
  })
})
