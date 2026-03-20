import type { Actions } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect-v2'

import { WalletConnectV2Connector } from './index'

type TestProvider = {
  accounts: string[]
  chainId: number
  session?: Record<string, unknown>
  signer?: {
    cleanup?: jest.Mock<Promise<void>, []>
    client?: {
      core?: {
        relayer?: {
          transportClose?: jest.Mock<Promise<void>, []>
        }
      }
    }
  }
}

const createActions = (): Actions => ({
  startActivation: jest.fn(() => jest.fn()),
  update: jest.fn(),
  resetState: jest.fn(),
})

function createConnector(actions: Actions = createActions()): WalletConnectV2Connector {
  return new WalletConnectV2Connector({
    actions,
    onError: jest.fn(),
    options: {
      projectId: 'test-project-id',
      chains: [1],
      optionalChains: [1],
      rpcMap: { 1: 'https://example.com' },
      showQrModal: true,
    },
  })
}

function attachProvider(connector: WalletConnectV2Connector, provider: TestProvider): void {
  ;(connector as unknown as { provider?: TestProvider }).provider = provider
}

describe('WalletConnectV2Connector', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('dedupes concurrent activate calls while establishing a session', async () => {
    const actions = createActions()
    const connector = createConnector(actions)
    let resolveActivation = (): void => undefined

    const activateSpy = jest.spyOn(WalletConnect.prototype, 'activate').mockImplementation(function (
      this: WalletConnectV2Connector,
    ) {
      return new Promise<void>((resolve) => {
        resolveActivation = () => {
          attachProvider(this, { accounts: ['0x1'], chainId: 1 })
          resolve()
        }
      })
    })

    const firstActivation = connector.activate(1)
    const secondActivation = connector.activate(1)

    expect(activateSpy).toHaveBeenCalledTimes(1)

    resolveActivation()
    await Promise.all([firstActivation, secondActivation])

    expect(actions.update).toHaveBeenCalledTimes(1)
    expect(actions.update).toHaveBeenCalledWith({ accounts: ['0x1'], chainId: 1 })
  })

  it('clears the single-flight guard after activation errors', async () => {
    const actions = createActions()
    const connector = createConnector(actions)

    const activateSpy = jest
      .spyOn(WalletConnect.prototype, 'activate')
      .mockRejectedValueOnce(new Error('boom'))
      .mockImplementationOnce(function (this: WalletConnectV2Connector) {
        attachProvider(this, { accounts: ['0x1'], chainId: 1 })

        return Promise.resolve()
      })

    await expect(connector.activate(1)).rejects.toThrow('boom')
    await expect(connector.activate(1)).resolves.toBeUndefined()

    expect(activateSpy).toHaveBeenCalledTimes(2)
    expect(actions.update).toHaveBeenCalledTimes(1)
  })

  it('dedupes concurrent eager connection attempts', async () => {
    const connector = createConnector()
    let resolveConnection = (): void => undefined

    const connectEagerlySpy = jest.spyOn(WalletConnect.prototype, 'connectEagerly').mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolveConnection = resolve
      })
    })

    const firstConnection = connector.connectEagerly()
    const secondConnection = connector.connectEagerly()

    expect(connectEagerlySpy).toHaveBeenCalledTimes(1)

    resolveConnection()
    await Promise.all([firstConnection, secondConnection])
  })

  it('cleans up cancelled pre-session providers during deactivation', async () => {
    const connector = createConnector()
    const cleanup = jest.fn<Promise<void>, []>().mockResolvedValue()
    const transportClose = jest.fn<Promise<void>, []>().mockResolvedValue()

    attachProvider(connector, {
      accounts: [],
      chainId: 1,
      signer: {
        cleanup,
        client: {
          core: {
            relayer: {
              transportClose,
            },
          },
        },
      },
    })

    jest.spyOn(WalletConnect.prototype, 'deactivate').mockResolvedValue()

    await connector.deactivate()

    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(transportClose).toHaveBeenCalledTimes(1)
  })
})
