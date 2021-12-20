import { useCallback } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { retry, RetryableError, RetryOptions } from 'utils/retry'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { RetryResult } from 'types/index'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }
const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {
  // [SupportedChainId.ARBITRUM_ONE]: { n: 10, minWait: 250, maxWait: 1000 },
  // [SupportedChainId.ARBITRUM_KOVAN]: { n: 10, minWait: 250, maxWait: 1000 },
}

export type GetReceipt = (hash: string) => RetryResult<TransactionReceipt>

export function useGetReceipt(): GetReceipt {
  const { chainId, library } = useActiveWeb3React()

  const getReceipt = useCallback<GetReceipt>(
    (hash) => {
      const retryOptions = chainId ? RETRY_OPTIONS_BY_CHAIN_ID[chainId] ?? DEFAULT_RETRY_OPTIONS : DEFAULT_RETRY_OPTIONS

      return retry(() => {
        if (!library || !chainId) throw new Error('No library or chainId yet')

        return library.getTransactionReceipt(hash).then((receipt) => {
          if (receipt === null) {
            console.debug('[useGetReceipt] Retrying for hash', hash)
            throw new RetryableError()
          }
          return receipt
        })
      }, retryOptions)
    },
    [chainId, library]
  )

  return getReceipt
}
