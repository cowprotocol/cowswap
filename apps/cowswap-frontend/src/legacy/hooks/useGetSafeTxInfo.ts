import { useCallback } from 'react'

import { retry, RetryOptions } from '@cowprotocol/common-utils'
import { getSafeTransaction } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'
import { SafeMultisigTransactionResponse } from '@safe-global/types-kit'

import { RetryResult } from 'types'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export type GetSafeTxInfo = (hash: string) => RetryResult<SafeMultisigTransactionResponse>

export function useGetSafeTxInfo(): GetSafeTxInfo {
  const { chainId } = useWalletInfo()

  const getSafeInfo = useCallback<GetSafeTxInfo>(
    (hash) => {
      return retry(() => getSafeTransaction(chainId, hash), DEFAULT_RETRY_OPTIONS)
    },
    [chainId],
  )

  return getSafeInfo
}
