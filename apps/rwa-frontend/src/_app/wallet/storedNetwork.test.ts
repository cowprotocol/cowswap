import { forgetUnsupportedStoredNetwork } from './storedNetwork'

import type { AppKitNetwork } from '@reown/appkit/networks'

const NETWORKS = [{ id: 1 }, { id: 42161 }] as AppKitNetwork[]

const mockStorage: { activeCaipNetworkId?: string } = {}

jest.mock('@reown/appkit-controllers', () => ({
  StorageUtil: {
    getActiveCaipNetworkId: () => mockStorage.activeCaipNetworkId,
    deleteActiveCaipNetworkId: () => {
      delete mockStorage.activeCaipNetworkId
    },
  },
}))

afterEach(() => {
  delete mockStorage.activeCaipNetworkId
})

describe('forgetUnsupportedStoredNetwork', () => {
  it('keeps a stored network the app offers', () => {
    mockStorage.activeCaipNetworkId = 'eip155:42161'

    forgetUnsupportedStoredNetwork(NETWORKS)

    expect(mockStorage.activeCaipNetworkId).toBe('eip155:42161')
  })

  it.each(['eip155:59144', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'])(
    'drops the stored %s network that CoW Swap left',
    (caipNetworkId) => {
      mockStorage.activeCaipNetworkId = caipNetworkId

      forgetUnsupportedStoredNetwork(NETWORKS)

      expect(mockStorage.activeCaipNetworkId).toBeUndefined()
    },
  )

  it('does nothing without a stored network', () => {
    forgetUnsupportedStoredNetwork(NETWORKS)

    expect(mockStorage.activeCaipNetworkId).toBeUndefined()
  })
})
