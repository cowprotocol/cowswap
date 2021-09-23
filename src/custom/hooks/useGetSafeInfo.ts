import { useCallback } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { getSafeTransaction } from 'api/gnosisSafe'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'

export type GetSafeInfo = (hash: string) => Promise<SafeMultisigTransactionResponse>

export function useGetSafeInfo(): GetSafeInfo {
  const { chainId } = useActiveWeb3React()

  const getSafeInfo = useCallback<GetSafeInfo>(
    (hash) => {
      if (chainId === undefined) {
        throw new Error('ChainId is undefined')
      }

      return getSafeTransaction(chainId, hash)
    },
    [chainId]
  )

  return getSafeInfo
}
