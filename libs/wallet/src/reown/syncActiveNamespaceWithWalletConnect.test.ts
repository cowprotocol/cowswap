import { ChainController, ConnectorController } from '@reown/appkit-controllers'

import {
  syncActiveNamespaceWithWalletConnect,
  WalletConnectNamespaceAppKit,
} from './syncActiveNamespaceWithWalletConnect'

jest.mock('@cowprotocol/common-utils', () => ({
  logWallet: { error: jest.fn() },
  normalizeError: (err: unknown) => err,
}))

jest.mock('@reown/appkit-controllers', () => ({
  ChainController: {
    state: {
      activeChain: undefined,
      chains: new Map([
        ['eip155', {}],
        ['solana', {}],
      ]),
    },
    getAccountData: jest.fn(),
  },
  ConnectorController: { getConnectorId: jest.fn() },
}))

const getAccountDataMock = ChainController.getAccountData as jest.Mock
const getConnectorIdMock = ConnectorController.getConnectorId as jest.Mock

const EVM_ADDRESS = '0x0000000000000000000000000000000000000001'
const SOLANA_ADDRESS = 'So1anaAddress'
const MAINNET_NETWORK = { id: 1, chainNamespace: 'eip155', caipNetworkId: 'eip155:1' }

interface NamespaceState {
  connectorId?: string
  address?: string
}

function createAppKit(
  sessionNamespaces?: Record<string, { accounts: string[] }>,
): jest.Mocked<WalletConnectNamespaceAppKit> {
  return {
    getUniversalProvider: jest
      .fn()
      .mockResolvedValue(sessionNamespaces ? { session: { namespaces: sessionNamespaces } } : {}),
    getCaipNetwork: jest.fn().mockReturnValue(MAINNET_NETWORK),
    switchNetwork: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<WalletConnectNamespaceAppKit>
}

function mockState(activeChain: string, namespaces: Record<string, NamespaceState>): void {
  ChainController.state.activeChain = activeChain as typeof ChainController.state.activeChain
  getConnectorIdMock.mockImplementation((namespace: string) => namespaces[namespace]?.connectorId)
  getAccountDataMock.mockImplementation((namespace: string) => ({ address: namespaces[namespace]?.address }))
}

describe('syncActiveNamespaceWithWalletConnect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('activates the EVM namespace when an EVM-only WalletConnect session was connected while on Solana', async () => {
    mockState('solana', { eip155: { connectorId: 'walletConnect', address: EVM_ADDRESS } })
    const appKit = createAppKit({ eip155: { accounts: [`eip155:1:${EVM_ADDRESS}`] } })

    await syncActiveNamespaceWithWalletConnect(appKit)

    expect(appKit.getCaipNetwork).toHaveBeenCalledWith('eip155')
    expect(appKit.switchNetwork).toHaveBeenCalledWith(MAINNET_NETWORK)
  })

  it('keeps Solana active while the session approved Solana but its account is not synced yet', async () => {
    mockState('solana', { eip155: { connectorId: 'walletConnect', address: EVM_ADDRESS } })
    const appKit = createAppKit({
      eip155: { accounts: [`eip155:1:${EVM_ADDRESS}`] },
      solana: { accounts: [`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:${SOLANA_ADDRESS}`] },
    })

    await syncActiveNamespaceWithWalletConnect(appKit)

    expect(appKit.switchNetwork).not.toHaveBeenCalled()
  })

  it('does nothing when the active namespace has an account', async () => {
    mockState('solana', {
      eip155: { connectorId: 'walletConnect', address: EVM_ADDRESS },
      solana: { connectorId: 'walletConnect', address: SOLANA_ADDRESS },
    })
    const appKit = createAppKit({ eip155: { accounts: [`eip155:1:${EVM_ADDRESS}`] } })

    await syncActiveNamespaceWithWalletConnect(appKit)

    expect(appKit.getUniversalProvider).not.toHaveBeenCalled()
    expect(appKit.switchNetwork).not.toHaveBeenCalled()
  })

  it('does nothing when the other namespace is connected through another connector', async () => {
    mockState('solana', { eip155: { connectorId: 'io.rabby', address: EVM_ADDRESS } })
    const appKit = createAppKit({ eip155: { accounts: [`eip155:1:${EVM_ADDRESS}`] } })

    await syncActiveNamespaceWithWalletConnect(appKit)

    expect(appKit.getUniversalProvider).not.toHaveBeenCalled()
    expect(appKit.switchNetwork).not.toHaveBeenCalled()
  })

  it('does nothing without a WalletConnect session', async () => {
    mockState('solana', { eip155: { connectorId: 'walletConnect', address: EVM_ADDRESS } })
    const appKit = createAppKit()

    await syncActiveNamespaceWithWalletConnect(appKit)

    expect(appKit.switchNetwork).not.toHaveBeenCalled()
  })
})
