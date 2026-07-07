import { useCallback } from 'react'

import { logSafeApi, retry, RetryOptions } from '@cowprotocol/common-utils'
import { getSafeTransaction, normalizeSafeError, SAFE_RATE_LIMIT_MSG } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'
import type { SafeMultisigTransactionResponse } from '@safe-global/types-kit'

import { RetryResult } from 'types'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export type GetSafeTxInfo = (hash: string) => RetryResult<SafeMultisigTransactionResponse>

export function useGetSafeTxInfo(): GetSafeTxInfo {
  const { chainId } = useWalletInfo()

  const getSafeTxInfo = useCallback<GetSafeTxInfo>(
    (hash) => {
      return retry(async () => {
        try {
          return await getSafeTransaction(chainId, hash)
        } catch (err: unknown) {
          const error = normalizeSafeError(err)
          if (error.statusCode === 429) {
            logSafeApi.error(new Error(SAFE_RATE_LIMIT_MSG))
          }
          throw error
        }
      }, DEFAULT_RETRY_OPTIONS)
    },
    [chainId],
  )

  return getSafeTxInfo
}
