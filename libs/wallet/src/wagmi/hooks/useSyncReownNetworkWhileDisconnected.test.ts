import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { solana } from '@reown/appkit/networks'
import { renderHook } from '@testing-library/react'

import { useSyncReownNetworkWhileDisconnected } from './useSyncReownNetworkWhileDisconnected'

import { reownAppKit } from '../config'

jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual('@cowprotocol/common-const'),
  IS_SOLANA_ENABLED: true,
}))

jest.mock('@reown/appkit/networks', () => ({
  solana: {
    id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    chainNamespace: 'solana',
    caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  },
}))

jest.mock('../config', () => ({
  reownAppKit: { switchNetwork: jest.fn(), getCaipNetwork: jest.fn() },
}))

const switchNetworkMock = reownAppKit.switchNetwork as jest.Mock
const getCaipNetworkMock = reownAppKit.getCaipNetwork as jest.Mock

describe('useSyncReownNetworkWhileDisconnected', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    switchNetworkMock.mockResolvedValue(undefined)
  })

  it('activates Solana in AppKit when Solana is selected without a connected wallet', () => {
    getCaipNetworkMock.mockReturnValue({ caipNetworkId: 'eip155:1' })

    renderHook(() => useSyncReownNetworkWhileDisconnected(SupportedChainId.SOLANA, false))

    expect(switchNetworkMock).toHaveBeenCalledWith(solana)
  })

  it('activates the selected EVM network when AppKit is still on Solana', () => {
    getCaipNetworkMock.mockReturnValue({ caipNetworkId: solana.caipNetworkId })

    renderHook(() => useSyncReownNetworkWhileDisconnected(SupportedChainId.MAINNET, false))

    expect(switchNetworkMock).toHaveBeenCalledWith(expect.objectContaining({ id: SupportedChainId.MAINNET }))
  })

  it('does nothing when AppKit is already on the selected network', () => {
    getCaipNetworkMock.mockReturnValue({ caipNetworkId: solana.caipNetworkId })

    renderHook(() => useSyncReownNetworkWhileDisconnected(SupportedChainId.SOLANA, false))

    expect(switchNetworkMock).not.toHaveBeenCalled()
  })

  it('leaves the network to the wallet while connected', () => {
    getCaipNetworkMock.mockReturnValue({ caipNetworkId: 'eip155:1' })

    renderHook(() => useSyncReownNetworkWhileDisconnected(SupportedChainId.SOLANA, true))

    expect(switchNetworkMock).not.toHaveBeenCalled()
  })
})
