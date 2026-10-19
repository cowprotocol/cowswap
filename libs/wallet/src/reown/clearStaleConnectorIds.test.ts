import { ChainController, ConnectorController } from '@reown/appkit-controllers'

import { clearStaleConnectorIds } from './clearStaleConnectorIds'

import type { ChainNamespace } from '@reown/appkit-common'
import type { AccountState, ChainControllerState } from '@reown/appkit-controllers'

jest.mock('@reown/appkit-controllers', () => ({
  ChainController: { state: { chains: new Map() }, getAccountData: jest.fn() },
  ConnectorController: { getConnectorId: jest.fn(), removeConnectorId: jest.fn() },
}))

const getAccountDataMock = ChainController.getAccountData as jest.Mock
const getConnectorIdMock = ConnectorController.getConnectorId as jest.Mock
const removeConnectorIdMock = ConnectorController.removeConnectorId as jest.Mock

interface NamespaceState {
  connectorId?: string
  account?: Pick<AccountState, 'caipAddress' | 'status'>
}

function mockNamespaces(namespaces: Record<string, NamespaceState>): void {
  const chains = new Map(Object.keys(namespaces).map((namespace) => [namespace as ChainNamespace, {}]))

  ChainController.state.chains = chains as ChainControllerState['chains']
  getConnectorIdMock.mockImplementation((namespace: string) => namespaces[namespace]?.connectorId)
  getAccountDataMock.mockImplementation((namespace: string) => namespaces[namespace]?.account)
}

describe('clearStaleConnectorIds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('forgets the connector of a namespace that has no account', () => {
    mockNamespaces({ solana: { connectorId: 'Phantom', account: { status: 'disconnected' } } })

    clearStaleConnectorIds()

    expect(removeConnectorIdMock).toHaveBeenCalledWith('solana')
  })

  it('keeps the connector of a namespace that has an account', () => {
    mockNamespaces({
      solana: { connectorId: 'Phantom', account: { caipAddress: 'solana:5eykt4:So1anaAddress', status: 'connected' } },
    })

    clearStaleConnectorIds()

    expect(removeConnectorIdMock).not.toHaveBeenCalled()
  })

  it.each(['connecting', 'reconnecting'] as const)('keeps the connector while the restore is %s', (status) => {
    mockNamespaces({ solana: { connectorId: 'Phantom', account: { status } } })

    clearStaleConnectorIds()

    expect(removeConnectorIdMock).not.toHaveBeenCalled()
  })

  it('leaves a namespace without an active connector untouched', () => {
    mockNamespaces({ solana: { account: { status: 'disconnected' } } })

    clearStaleConnectorIds()

    expect(removeConnectorIdMock).not.toHaveBeenCalled()
  })

  it('clears only the namespaces that lost their account', () => {
    mockNamespaces({
      eip155: {
        connectorId: 'metaMask',
        account: { caipAddress: 'eip155:1:0x0000000000000000000000000000000000000001', status: 'connected' },
      },
      solana: { connectorId: 'Phantom', account: { status: 'disconnected' } },
    })

    clearStaleConnectorIds()

    expect(removeConnectorIdMock).toHaveBeenCalledTimes(1)
    expect(removeConnectorIdMock).toHaveBeenCalledWith('solana')
  })

  it('does not let a controller failure block the modal', () => {
    mockNamespaces({ solana: { connectorId: 'Phantom', account: { status: 'disconnected' } } })
    removeConnectorIdMock.mockImplementation(() => {
      throw new Error('boom')
    })

    expect(() => clearStaleConnectorIds()).not.toThrow()
  })
})
