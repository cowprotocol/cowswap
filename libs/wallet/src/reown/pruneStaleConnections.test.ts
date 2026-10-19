import { ChainController, ConnectionController, StorageUtil } from '@reown/appkit-controllers'

import { pruneStaleConnections } from './pruneStaleConnections'

import type { ChainNamespace } from '@reown/appkit-common'
import type { AccountState, ChainControllerState } from '@reown/appkit-controllers'

jest.mock('@reown/appkit-controllers', () => ({
  ChainController: { state: { chains: new Map() }, getAccountData: jest.fn() },
  ConnectionController: { getConnections: jest.fn(), setConnections: jest.fn() },
  StorageUtil: { deleteAddressFromConnection: jest.fn() },
}))

const getAccountDataMock = ChainController.getAccountData as jest.Mock
const getConnectionsMock = ConnectionController.getConnections as jest.Mock
const setConnectionsMock = ConnectionController.setConnections as jest.Mock
const deleteAddressMock = StorageUtil.deleteAddressFromConnection as jest.Mock

interface NamespaceState {
  account?: Pick<AccountState, 'caipAddress' | 'status'>
  connections?: { connectorId: string; accounts: { address: string }[] }[]
}

function mockNamespaces(namespaces: Record<string, NamespaceState>): void {
  const chains = new Map(Object.keys(namespaces).map((namespace) => [namespace as ChainNamespace, {}]))

  ChainController.state.chains = chains as ChainControllerState['chains']
  getAccountDataMock.mockImplementation((namespace: string) => namespaces[namespace]?.account)
  getConnectionsMock.mockImplementation((namespace: string) => namespaces[namespace]?.connections ?? [])
}

const PHANTOM = { connectorId: 'Phantom', accounts: [{ address: 'So1anaAddress' }] }

describe('pruneStaleConnections', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('drops the records of a namespace that has no account', () => {
    mockNamespaces({ solana: { account: { status: 'disconnected' }, connections: [PHANTOM] } })

    pruneStaleConnections()

    expect(deleteAddressMock).toHaveBeenCalledWith({
      connectorId: 'Phantom',
      address: 'So1anaAddress',
      namespace: 'solana',
    })
    expect(setConnectionsMock).toHaveBeenCalledWith([], 'solana')
  })

  it('drops every account of a multi-account record', () => {
    mockNamespaces({
      solana: {
        account: { status: 'disconnected' },
        connections: [
          { connectorId: 'Phantom', accounts: [{ address: 'FirstAddress' }, { address: 'SecondAddress' }] },
        ],
      },
    })

    pruneStaleConnections()

    expect(deleteAddressMock).toHaveBeenCalledTimes(2)
    expect(deleteAddressMock).toHaveBeenCalledWith(expect.objectContaining({ address: 'FirstAddress' }))
    expect(deleteAddressMock).toHaveBeenCalledWith(expect.objectContaining({ address: 'SecondAddress' }))
  })

  it('keeps the records of a namespace that has an account', () => {
    mockNamespaces({
      solana: { account: { caipAddress: 'solana:5eykt4:So1anaAddress', status: 'connected' }, connections: [PHANTOM] },
    })

    pruneStaleConnections()

    expect(deleteAddressMock).not.toHaveBeenCalled()
    expect(setConnectionsMock).not.toHaveBeenCalled()
  })

  it.each(['connecting', 'reconnecting'] as const)('keeps the records while the restore is %s', (status) => {
    mockNamespaces({ solana: { account: { status }, connections: [PHANTOM] } })

    pruneStaleConnections()

    expect(deleteAddressMock).not.toHaveBeenCalled()
    expect(setConnectionsMock).not.toHaveBeenCalled()
  })

  it('leaves a namespace without records untouched', () => {
    mockNamespaces({ solana: { account: { status: 'disconnected' } } })

    pruneStaleConnections()

    expect(setConnectionsMock).not.toHaveBeenCalled()
  })

  it('prunes only the namespaces that lost their account', () => {
    mockNamespaces({
      eip155: {
        account: { caipAddress: 'eip155:1:0x0000000000000000000000000000000000000001', status: 'connected' },
        connections: [
          { connectorId: 'metaMask', accounts: [{ address: '0x0000000000000000000000000000000000000001' }] },
        ],
      },
      solana: { account: { status: 'disconnected' }, connections: [PHANTOM] },
    })

    pruneStaleConnections()

    expect(setConnectionsMock).toHaveBeenCalledTimes(1)
    expect(setConnectionsMock).toHaveBeenCalledWith([], 'solana')
  })
})
