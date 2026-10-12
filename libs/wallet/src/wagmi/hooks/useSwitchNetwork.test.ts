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
  reownAppKit: { switchNetwork: jest.fn() },
}))

jest.mock('../../api/hooks/useNetworkSwitchUnsupported', () => ({
  useNetworkSwitchUnsupported: () => false,
}))

const useConnectionMock = useConnection as jest.Mock
const switchNetworkMock = reownAppKit.switchNetwork as jest.Mock

describe('useSwitchNetwork', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useConnectionMock.mockReturnValue({ isConnected: true })
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
})
