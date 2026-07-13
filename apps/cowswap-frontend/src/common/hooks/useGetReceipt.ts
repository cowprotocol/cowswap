import { useCallback } from 'react'

import type { TransactionReceipt, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { getTransaction, getTransactionReceipt } from 'wagmi/actions'

import { retry, RetryableError, RetryOptions } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }
const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {}

export type GetReceipt = (hash: string) => RetryResult<TransactionReceipt>

interface RetryResult<T> {
  promise: Promise<T>
  cancel: Command
}

/**
 * Thrown when a transaction hash is not found on-chain or in the mempool.
 * This typically occurs with MetaMask Smart Transactions (STX) where a synthetic hash
 * is returned to the dapp but the transaction is cancelled before being broadcast.
 */
export class TransactionNotBroadcastError extends Error {
  constructor(hash: string) {
    super(`Transaction ${hash} not found on-chain or in mempool`)
    this.name = 'TransactionNotBroadcastError'
  }
}

export function useGetReceipt(chainId: SupportedChainId): GetReceipt {
  const config = useConfig()

  const getReceipt = useCallback<GetReceipt>(
    (hash) => {
      const retryOptions = RETRY_OPTIONS_BY_CHAIN_ID[chainId] || DEFAULT_RETRY_OPTIONS

      return retry(async () => {
        // Check if the receipt is already available (non-blocking, returns immediately).
        // Swallow all errors — any failure just means "no receipt yet" and we proceed to
        // check whether the transaction exists at all.
        const receipt = await getTransactionReceipt(config, { hash: hash as Hex }).catch(() => null)
        if (receipt) return receipt

        // No receipt. Check whether the transaction exists anywhere (mempool or chain).
        // If it doesn't exist, the hash was never broadcast — e.g. MetaMask Smart Transactions
        // returns a synthetic hash that is cancelled before any real tx is submitted.
        let txExists: boolean
        try {
          await getTransaction(config, { hash: hash as Hex })
          txExists = true
        } catch (e: unknown) {
          const name = (e as { name?: string })?.name
          if (name === 'TransactionNotFoundError') {
            txExists = false
          } else {
            // Network / RPC error (e.g. 402, timeout): we can't determine if the tx exists.
            // Retry the check on the next attempt rather than making an assumption.
            throw new RetryableError()
          }
        }

        if (!txExists) {
          throw new TransactionNotBroadcastError(hash)
        }

        // Transaction is in the mempool but not yet mined — retry
        throw new RetryableError()
      }, retryOptions)
    },
    [config, chainId],
  )

  return getReceipt
}
