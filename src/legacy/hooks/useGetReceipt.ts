import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { retry, RetryableError, RetryOptions } from 'legacy/utils/retry'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { RetryResult } from 'types'
import { supportedChainId } from 'legacy/utils/supportedChainId'
import { useWalletInfo } from 'modules/wallet'

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }
const RETRY_OPTIONS_BY_CHAIN_ID: { [chainId: number]: RetryOptions } = {}

export type GetReceipt = (hash: string) => RetryResult<TransactionReceipt>

export function useGetReceipt(): GetReceipt {
  const { provider } = useWeb3React()
  const { chainId } = useWalletInfo()

  const getReceipt = useCallback<GetReceipt>(
    (hash) => {
      const retryOptions = chainId ? RETRY_OPTIONS_BY_CHAIN_ID[chainId] ?? DEFAULT_RETRY_OPTIONS : DEFAULT_RETRY_OPTIONS

      return retry(() => {
        if (!provider || !chainId) throw new Error('No provider or chainId yet')
        if (!supportedChainId(chainId)) throw new Error('Unsupported chainId: ' + chainId)

        return provider.getTransactionReceipt(hash).then((receipt) => {
          if (receipt === null) {
            console.debug('[useGetReceipt] Retrying for hash', hash)
            throw new RetryableError()
          }
          return receipt
        })
      }, retryOptions)
    },
    [chainId, provider]
  )

  return getReceipt
}
