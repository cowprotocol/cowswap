import { useCallback } from 'react'

import { retry, RetryableError, RetryOptions } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }
const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {}

interface RetryResult<T> {
  promise: Promise<T>
  cancel: Command
}

export type GetReceipt = (hash: string) => RetryResult<TransactionReceipt>

export function useGetReceipt(chainId: SupportedChainId): GetReceipt {
  const provider = useWalletProvider()

  const getReceipt = useCallback<GetReceipt>(
    (hash) => {
      const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] || DEFAULT_RETRY_OPTIONS

      return retry(() => {
        if (!provider) throw new Error('No provider yet')

        return provider.getTransactionReceipt(hash).then((receipt) => {
          if (receipt === null) {
            console.debug('[useGetReceipt] Retrying for hash', hash)
            throw new RetryableError()
          }
          return receipt
        })
      }, retryOptions)
    },
    [chainId, provider]
  )

  return getReceipt
}
