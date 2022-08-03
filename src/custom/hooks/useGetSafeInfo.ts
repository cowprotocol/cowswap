import { useCallback } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { getSafeTransaction } from 'api/gnosisSafe'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { retry, RetryOptions } from 'utils/retry'
import { RetryResult } from '../types'
import { Web3Provider } from '@ethersproject/providers'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export type GetSafeInfo = (hash: string) => RetryResult<SafeMultisigTransactionResponse>

export function useGetSafeInfo(): GetSafeInfo {
  const { chainId, library } = useActiveWeb3React()

  return useCallback<GetSafeInfo>(
    (hash) => {
      return retry(() => {
        if (chainId === undefined) {
          throw new Error('No chainId yet')
        }

        if (!library) {
          throw new Error('No library yet')
        }

        return getSafeTransaction(chainId, hash, library as Web3Provider)
      }, DEFAULT_RETRY_OPTIONS)
    },
    [chainId, library]
  )
}
