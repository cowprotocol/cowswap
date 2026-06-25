import { useMemo } from 'react'

import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { EvmChains } from '@cowprotocol/cow-sdk'
import { ConnectionType, getInjectedProvider, useWalletInfo } from '@cowprotocol/wallet'

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
import * as wagmi from 'wagmi'

export type WalletClientSource = 'wagmi' | 'injected-fallback' | null

interface UseWalletClientWithFallbackParams {
  chainId?: number
  account?: string
}

interface CreateInjectedWalletClientParams {
  chainId: number
  account?: string
  provider?: EIP1193Provider
}

interface InjectedWalletClientFallbackParams {
  hasWalletClient: boolean
  walletStatus: string
  walletChainId?: number
  requestedChainId?: number
  connectorType?: string
}

interface WalletClientWithFallback {
  walletClient: WalletClient | undefined
  walletClientSource: WalletClientSource
  walletClientQuery: ReturnType<typeof wagmi.useWalletClient>
}

export function useWalletClientWithFallback({
  chainId,
  account,
}: UseWalletClientWithFallbackParams = {}): WalletClientWithFallback {
  const { chainId: walletChainId, account: walletAccount } = useWalletInfo()
  const effectiveChainId = chainId ?? walletChainId
  const effectiveAccount = account ?? walletAccount
  const walletConnection = wagmi.useConnection()
  const connectorType = walletConnection.connector?.type
  const walletClientQuery = wagmi.useWalletClient({
    chainId: effectiveChainId,
    query: { enabled: walletConnection.status === 'connected' },
  })

  const fallbackWalletClient = useMemo(() => {
    const canUseFallback = canUseInjectedWalletClientFallback({
      hasWalletClient: Boolean(walletClientQuery.data),
      walletStatus: walletConnection.status,
      walletChainId: walletConnection.chainId,
      requestedChainId: effectiveChainId,
      connectorType,
    })

    if (!canUseFallback || !effectiveChainId) return undefined

    return createInjectedWalletClient({
      chainId: effectiveChainId,
      account: effectiveAccount,
      provider: getInjectedProvider(),
    })
  }, [
    effectiveAccount,
    effectiveChainId,
    connectorType,
    walletClientQuery.data,
    walletConnection.chainId,
    walletConnection.status,
  ])

  const walletClient = walletClientQuery.data || fallbackWalletClient
  const walletClientSource = walletClientQuery.data ? 'wagmi' : fallbackWalletClient ? 'injected-fallback' : null

  return { walletClient, walletClientSource, walletClientQuery }
}

export function canUseInjectedWalletClientFallback({
  hasWalletClient,
  walletStatus,
  walletChainId,
  requestedChainId,
  connectorType,
}: InjectedWalletClientFallbackParams): boolean {
  if (hasWalletClient) return false
  if (walletStatus !== 'connected') return false
  if (!requestedChainId) return false
  if (walletChainId !== requestedChainId) return false

  return connectorType === ConnectionType.INJECTED
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
