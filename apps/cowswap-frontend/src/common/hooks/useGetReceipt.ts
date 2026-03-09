import { useCallback } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { retry, RetryableError, RetryOptions } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { JsonRpcProvider, Provider } from '@ethersproject/providers'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }
const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {}

export type GetReceipt = (hash: string) => RetryResult<TransactionReceipt>

interface RetryResult<T> {
  promise: Promise<T>
  cancel: Command
}

export function useGetReceipt(chainId: SupportedChainId): GetReceipt {
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const walletProvider = useWalletProvider()
  const rpcProvider = getRpcProvider(chainId)

  const getReceipt = useCallback<GetReceipt>(
    (hash) => {
      const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] || DEFAULT_RETRY_OPTIONS
      const providers = getReceiptProviders(walletProvider, rpcProvider)

      return retry(() => fetchTransactionReceipt(hash, providers), retryOptions)
    },
    [chainId, rpcProvider, walletProvider],
  )

  return getReceipt
}

async function fetchTransactionReceipt(hash: string, providers: Provider[]): Promise<TransactionReceipt> {
  if (!providers.length) {
    throw new Error('No provider yet')
  }

  for (const provider of providers) {
    try {
      const receipt = await provider.getTransactionReceipt(hash)

      if (receipt) {
        return receipt
      }
    } catch (error) {
      console.debug('[useGetReceipt] Receipt lookup failed, trying next provider', { hash, error })
    }
  }

  console.debug('[useGetReceipt] Retrying for hash', hash)
  throw new RetryableError()
}

function getReceiptProviders(walletProvider: Provider | undefined, rpcProvider: JsonRpcProvider | null): Provider[] {
  if (walletProvider && rpcProvider && walletProvider === rpcProvider) {
    return [walletProvider]
  }

  return [walletProvider, rpcProvider].filter((provider): provider is Provider => Boolean(provider))
}
