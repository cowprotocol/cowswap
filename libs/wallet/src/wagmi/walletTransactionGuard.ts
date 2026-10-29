import { createClient, custom, getAddress, type EIP1193Provider } from 'viem'
import type { Config, Connector } from 'wagmi'

export interface GuardedTransaction {
  from?: string
  to?: string
  data?: string
}

/**
 * Throw from the guard to block the request: the error is propagated to the caller instead of reaching the wallet.
 */
export type WalletTransactionGuard = (transactions: GuardedTransaction[], chainId: number) => void

type RequestArguments = Parameters<EIP1193Provider['request']>[0]

const TRANSACTION_METHODS = new Set(['eth_sendTransaction', 'eth_signTransaction'])
const BATCH_METHODS = new Set(['wallet_sendCalls'])

const guardedConfigs = new WeakSet<Config>()
const patchedConnectors = new WeakSet<Connector>()

let transactionGuard: WalletTransactionGuard | null = null

export function getGuardedTransactions(args: { method: string; params?: unknown }): GuardedTransaction[] {
  const [first] = Array.isArray(args.params) ? args.params : []

  if (!isRecord(first)) return []

  if (TRANSACTION_METHODS.has(args.method)) return [toGuardedTransaction(first)]

  if (BATCH_METHODS.has(args.method)) {
    const calls = Array.isArray(first.calls) ? first.calls.filter(isRecord) : []
    const from = typeof first.from === 'string' ? first.from : undefined

    return calls.map((call) => ({ ...toGuardedTransaction(call), from }))
  }

  return []
}

/**
 * wagmi builds connector clients through `connector.getClient` when it is defined,
 * so defining it lets every transaction go through the guard
 * without replacing `connector.getProvider`, whose identity the tab isolation relies on.
 */
export function installWalletTransactionGuard(config: Config, guard: WalletTransactionGuard): void {
  transactionGuard = guard

  if (guardedConfigs.has(config)) return

  guardedConfigs.add(config)

  const patchConnectors = (connectors: readonly Connector[]): void => {
    connectors.forEach((connector) => patchConnector(config, connector))
  }

  patchConnectors(config.connectors)
  config._internal.connectors.subscribe(patchConnectors)
}

/**
 * For transactions sent without a wagmi connector client, such as through the Safe Apps SDK.
 */
export function runWalletTransactionGuard(transactions: GuardedTransaction[], chainId: number): void {
  if (transactionGuard && transactions.length) transactionGuard(transactions, chainId)
}

function createGuardedProvider(
  provider: EIP1193Provider,
  chainId: number,
): { request(args: RequestArguments): Promise<unknown> } {
  return {
    request: async (args) => {
      runWalletTransactionGuard(getGuardedTransactions(args), chainId)

      return provider.request(args)
    },
  }
}

async function getConnectorAccounts(config: Config, connector: Connector): Promise<readonly string[]> {
  return config.state.connections.get(connector.uid)?.accounts ?? connector.getAccounts()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function patchConnector(config: Config, connector: Connector): void {
  if (connector.getClient || patchedConnectors.has(connector)) return

  patchedConnectors.add(connector)

  connector.getClient = async ({ chainId } = {}) => {
    const resolvedChainId = chainId ?? (await connector.getChainId())
    const [provider, accounts] = await Promise.all([
      connector.getProvider({ chainId: resolvedChainId }) as Promise<EIP1193Provider>,
      getConnectorAccounts(config, connector),
    ])
    const [account] = accounts

    return createClient({
      account: account ? getAddress(account) : undefined,
      chain: config.chains.find((chain) => chain.id === resolvedChainId),
      name: 'Connector Client',
      transport: (opts) => custom(createGuardedProvider(provider, resolvedChainId))({ ...opts, retryCount: 0 }),
    })
  }
}

function toGuardedTransaction(value: Record<string, unknown>): GuardedTransaction {
  return {
    from: typeof value.from === 'string' ? value.from : undefined,
    to: typeof value.to === 'string' ? value.to : undefined,
    data: typeof value.data === 'string' ? value.data : undefined,
  }
}
