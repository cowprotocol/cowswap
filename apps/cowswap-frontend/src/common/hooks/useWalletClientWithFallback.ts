import { useMemo } from 'react'

import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { EvmChains } from '@cowprotocol/cow-sdk'
import { ConnectionType, getInjectedProvider } from '@cowprotocol/wallet'

import {
  type Address,
  type Chain,
  type EIP1193Provider,
  type WalletClient,
  createWalletClient,
  custom,
  getAddress,
  isAddress,
} from 'viem'
import { useConnection, useWalletClient } from 'wagmi'

export type WalletClientSource = 'wagmi' | 'injected-fallback' | null

interface UseWalletClientWithFallbackParams {
  chainId: number
  account?: string
}

interface CreateInjectedWalletClientParams extends UseWalletClientWithFallbackParams {
  provider?: EIP1193Provider
}

interface WalletClientWithFallback {
  walletClient: WalletClient | undefined
  walletClientSource: WalletClientSource
  walletClientQuery: ReturnType<typeof useWalletClient>
}

export function useWalletClientWithFallback({
  chainId,
  account,
}: UseWalletClientWithFallbackParams): WalletClientWithFallback {
  const walletConnection = useConnection()
  const walletClientQuery = useWalletClient({
    chainId,
    query: { enabled: walletConnection.status === 'connected' },
  })

  const fallbackWalletClient = useMemo(() => {
    if (walletClientQuery.data) return undefined
    if (walletConnection.status !== 'connected') return undefined
    if (walletConnection.chainId !== chainId) return undefined
    if (walletConnection.connector?.type !== ConnectionType.INJECTED) return undefined
    if (walletConnection.connector.id !== 'injected') return undefined

    return createInjectedWalletClient({ chainId, account, provider: getInjectedProvider() })
  }, [
    account,
    chainId,
    walletClientQuery.data,
    walletConnection.chainId,
    walletConnection.connector?.id,
    walletConnection.connector?.type,
    walletConnection.status,
  ])

  const walletClient = walletClientQuery.data || fallbackWalletClient
  const walletClientSource = walletClientQuery.data ? 'wagmi' : fallbackWalletClient ? 'injected-fallback' : null

  return { walletClient, walletClientSource, walletClientQuery }
}

export function createInjectedWalletClient({
  chainId,
  account,
  provider,
}: CreateInjectedWalletClientParams): WalletClient | undefined {
  const chain = getViemChain(chainId)
  const walletAccount = getWalletAccount(account)

  if (!chain || !walletAccount || !provider) return undefined

  return createWalletClient({
    account: walletAccount,
    chain,
    transport: custom(provider),
  })
}

function getViemChain(chainId: number): Chain | undefined {
  return Object.prototype.hasOwnProperty.call(VIEM_CHAINS, chainId) ? VIEM_CHAINS[chainId as EvmChains] : undefined
}

function getWalletAccount(account?: string): Address | undefined {
  if (!account || !isAddress(account)) return undefined

  return getAddress(account)
}
