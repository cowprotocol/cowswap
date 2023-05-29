import { useCallback } from 'react'

import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { useWeb3React } from '@web3-react/core'

import { RetryResult } from 'types'

import { retry, RetryOptions } from 'legacy/utils/retry'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

import { getSafeTransaction } from 'api/gnosisSafe'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

export type GetSafeInfo = (hash: string) => RetryResult<SafeMultisigTransactionResponse>

export function useGetSafeInfo(): GetSafeInfo {
  const { provider } = useWeb3React()
  const { chainId } = useWalletInfo()

  const getSafeInfo = useCallback<GetSafeInfo>(
    (hash) => {
      return retry(() => {
        if (!provider) {
          throw new Error('There is no provider to get Gnosis safe info')
        }

        if (chainId === undefined || !supportedChainId(chainId)) {
          throw new Error('Unsupported chainId: ' + chainId)
        }

        return getSafeTransaction(chainId, hash, provider)
      }, DEFAULT_RETRY_OPTIONS)
    },
    [chainId, provider]
  )

  return getSafeInfo
}
