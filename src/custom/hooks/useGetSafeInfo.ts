import { useCallback } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { getSafeTransaction } from 'api/gnosisSafe'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { retry, RetryOptions } from 'utils/retry'
import { RetryResult } from '../types'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export type GetSafeInfo = (hash: string) => RetryResult<SafeMultisigTransactionResponse>

export function useGetSafeInfo(): GetSafeInfo {
  const { chainId } = useActiveWeb3React()

  const getSafeInfo = useCallback<GetSafeInfo>(
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

  return getSafeInfo
}
