import { useCallback } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { getSafeTransaction } from 'api/gnosisSafe'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { retry, RetryOptions } from 'utils/retry'
import { RetryResult } from '../types'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export type GetSafeTransactionInfo = (hash: string) => RetryResult<SafeMultisigTransactionResponse>

export function useGetSafeTransactionInfo(): GetSafeTransactionInfo {
  const { chainId } = useActiveWeb3React()

  const getSafeTransactionInfo = useCallback<GetSafeTransactionInfo>(
    (hash) => {
      return retry(() => {
        if (chainId === undefined) {
          throw new Error('No chainId yet')
        }

        return getSafeTransaction(chainId, hash)
      }, DEFAULT_RETRY_OPTIONS)
    },
    [chainId]
  )

  return getSafeTransactionInfo
}
