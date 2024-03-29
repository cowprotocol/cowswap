import { useCallback } from 'react'

import { retry, RetryOptions } from '@cowprotocol/common-utils'
import { getSafeTransaction } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { useWeb3React } from '@web3-react/core'

import { RetryResult } from 'types'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export type GetSafeTxInfo = (hash: string) => RetryResult<SafeMultisigTransactionResponse>

export function useGetSafeTxInfo(): GetSafeTxInfo {
  const { provider } = useWeb3React()
  const { chainId } = useWalletInfo()

  const getSafeInfo = useCallback<GetSafeTxInfo>(
    (hash) => {
      return retry(() => {
        if (!provider) {
          throw new Error('There is no provider to get Gnosis safe info')
        }

        return getSafeTransaction(chainId, hash, provider)
      }, DEFAULT_RETRY_OPTIONS)
    },
    [chainId, provider]
  )

  return getSafeInfo
}
