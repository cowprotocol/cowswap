import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ChainController, ConnectorController } from '@reown/appkit-controllers'

import { hasWalletConnectAccountForChain } from './hasWalletConnectAccountForChain'

jest.mock('@reown/appkit-controllers', () => ({
  ChainController: { getAccountData: jest.fn() },
  ConnectorController: { getConnectorId: jest.fn() },
}))

const getAccountDataMock = ChainController.getAccountData as jest.Mock
const getConnectorIdMock = ConnectorController.getConnectorId as jest.Mock

function mockNamespaces(namespaces: Record<string, { connectorId: string; address?: string }>): void {
  getConnectorIdMock.mockImplementation((namespace: string) => namespaces[namespace]?.connectorId)
  getAccountDataMock.mockImplementation((namespace: string) =>
    namespaces[namespace] ? { address: namespaces[namespace].address } : undefined,
  )
}

describe('hasWalletConnectAccountForChain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns true when the WalletConnect session has an account in the Solana namespace', () => {
    mockNamespaces({ solana: { connectorId: 'walletConnect', address: 'So1anaAddress' } })

    expect(hasWalletConnectAccountForChain(SupportedChainId.SOLANA)).toBe(true)
    expect(getConnectorIdMock).toHaveBeenCalledWith('solana')
  })

  it('returns true when the WalletConnect session has an account in the EVM namespace', () => {
    mockNamespaces({ eip155: { connectorId: 'walletConnect', address: '0x0000000000000000000000000000000000000001' } })

    expect(hasWalletConnectAccountForChain(SupportedChainId.MAINNET)).toBe(true)
    expect(getConnectorIdMock).toHaveBeenCalledWith('eip155')
  })

  it('returns false when the WalletConnect session did not approve the target namespace', () => {
    mockNamespaces({ solana: { connectorId: 'walletConnect' } })

    expect(hasWalletConnectAccountForChain(SupportedChainId.SOLANA)).toBe(false)
  })

  it('returns false when the target namespace is connected through another connector', () => {
    mockNamespaces({ solana: { connectorId: 'phantom', address: 'So1anaAddress' } })

    expect(hasWalletConnectAccountForChain(SupportedChainId.SOLANA)).toBe(false)
  })
})
