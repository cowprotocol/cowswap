import { useCallback } from 'react'

import { retry, RetryableError, RetryOptions } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import { useConfig } from 'wagmi'
import { getTransactionReceipt } from 'wagmi/actions'

import type { TransactionReceipt, Hex } from 'viem'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }
const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {}

interface RetryResult<T> {
  promise: Promise<T>
  cancel: Command
}

export type GetReceipt = (hash: string) => RetryResult<TransactionReceipt>

export function useGetReceipt(chainId: SupportedChainId): GetReceipt {
  const config = useConfig()

  const getReceipt = useCallback<GetReceipt>(
    (hash) => {
      const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] || DEFAULT_RETRY_OPTIONS

      return retry(() => {
        return getTransactionReceipt(config, { hash: hash as Hex }).then((receipt) => {
          if (receipt === null) {
            console.debug('[useGetReceipt] Retrying for hash', hash)
            throw new RetryableError()
          }
          return receipt
        })
      }, retryOptions)
    },
    [config, chainId],
  )

  return getReceipt
}
