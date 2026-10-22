import type { EIP1193Provider } from 'viem'
import type { Config, Connector } from 'wagmi'

import {
  getGuardedTransactions,
  installWalletTransactionGuard,
  setWalletTransactionGuard,
} from './walletTransactionGuard'

const ACCOUNT = '0x1111111111111111111111111111111111111111'
const TO = '0x2222222222222222222222222222222222222222'
const CHAIN_ID = 1

function createConfig(connectors: Connector[]): Config & { emitConnectors(connectors: Connector[]): void } {
  let listener: ((connectors: Connector[]) => void) | undefined

  return {
    connectors,
    chains: [{ id: CHAIN_ID }],
    state: { connections: new Map() },
    _internal: {
      connectors: {
        subscribe: (cb: (connectors: Connector[]) => void) => {
          listener = cb
        },
      },
    },
    emitConnectors: (next: Connector[]) => listener?.(next),
  } as unknown as Config & { emitConnectors(connectors: Connector[]): void }
}

function createConnector(provider: Pick<EIP1193Provider, 'request'>): Connector {
  return {
    uid: 'connector-uid',
    getProvider: jest.fn().mockResolvedValue(provider),
    getAccounts: jest.fn().mockResolvedValue([ACCOUNT]),
    getChainId: jest.fn().mockResolvedValue(CHAIN_ID),
  } as unknown as Connector
}

describe('getGuardedTransactions', () => {
  it('extracts eth_sendTransaction params', () => {
    expect(
      getGuardedTransactions({ method: 'eth_sendTransaction', params: [{ from: ACCOUNT, to: TO, data: '0x01' }] }),
    ).toEqual([{ from: ACCOUNT, to: TO, data: '0x01' }])
  })

  it('extracts every call of wallet_sendCalls', () => {
    expect(
      getGuardedTransactions({
        method: 'wallet_sendCalls',
        params: [{ from: ACCOUNT, calls: [{ to: TO, data: '0x01' }, { to: ACCOUNT }] }],
      }),
    ).toEqual([
      { from: ACCOUNT, to: TO, data: '0x01' },
      { from: ACCOUNT, to: ACCOUNT, data: undefined },
    ])
  })

  it('ignores other methods', () => {
    expect(getGuardedTransactions({ method: 'eth_call', params: [{ to: TO, data: '0x01' }] })).toEqual([])
  })
})

describe('installWalletTransactionGuard', () => {
  afterEach(() => {
    setWalletTransactionGuard(null)
  })

  it('blocks a transaction rejected by the guard before it reaches the wallet', async () => {
    const request = jest.fn()
    const connector = createConnector({ request } as Pick<EIP1193Provider, 'request'>)
    const guard = jest.fn(() => {
      throw new Error('blocked')
    })

    installWalletTransactionGuard(createConfig([connector]))
    setWalletTransactionGuard(guard)

    const client = await connector.getClient?.({ chainId: CHAIN_ID })

    await expect(
      client?.request({ method: 'eth_sendTransaction', params: [{ from: ACCOUNT, to: TO, data: '0x01' }] } as never),
    ).rejects.toThrow('blocked')
    expect(guard).toHaveBeenCalledWith([{ from: ACCOUNT, to: TO, data: '0x01' }], CHAIN_ID)
    expect(request).not.toHaveBeenCalled()
  })

  it('forwards requests allowed by the guard', async () => {
    const request = jest.fn().mockResolvedValue('0xhash')
    const connector = createConnector({ request } as Pick<EIP1193Provider, 'request'>)
    const guard = jest.fn()

    installWalletTransactionGuard(createConfig([connector]))
    setWalletTransactionGuard(guard)

    const client = await connector.getClient?.({ chainId: CHAIN_ID })
    const result = await client?.request({ method: 'eth_sendTransaction', params: [{ to: TO }] } as never)

    expect(result).toBe('0xhash')
    expect(guard).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('guards connectors added after installation', async () => {
    const request = jest.fn()
    const connector = createConnector({ request } as Pick<EIP1193Provider, 'request'>)
    const config = createConfig([])

    installWalletTransactionGuard(config)
    config.emitConnectors([connector])
    setWalletTransactionGuard(() => {
      throw new Error('blocked')
    })

    const client = await connector.getClient?.({ chainId: CHAIN_ID })

    await expect(client?.request({ method: 'eth_sendTransaction', params: [{ to: TO }] } as never)).rejects.toThrow(
      'blocked',
    )
  })

  it('keeps an existing connector getClient', () => {
    const getClient = jest.fn()
    const connector = { ...createConnector({ request: jest.fn() } as never), getClient } as unknown as Connector

    installWalletTransactionGuard(createConfig([connector]))

    expect(connector.getClient).toBe(getClient)
  })
})
