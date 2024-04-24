import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { getPermitUtilsInstance, PermitHookData } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { Nullish } from 'types'

import { getPermitCacheAtom } from '../state/permitCacheAtom'

export function useGetCachedPermit(): (tokenAddress: Nullish<string>) => Promise<PermitHookData | undefined> {
  const { chainId, account } = useWalletInfo()
  const { provider } = useWeb3React()
  const getCachedPermit = useSetAtom(getPermitCacheAtom)

  return useCallback(
    async (tokenAddress: Nullish<string>) => {
      if (!provider || !account || !tokenAddress) {
        return
      }

      try {
        const eip2162Utils = getPermitUtilsInstance(chainId, provider, account)

        // Always get the nonce for the real account, to know whether the cache should be invalidated
        // Static account should never need to pre-check the nonce as it'll never change once cached
        const nonce = account ? await eip2162Utils.getTokenNonce(tokenAddress, account) : undefined

        const permitParams = { chainId, tokenAddress, account, nonce }

        return getCachedPermit(permitParams)
      } catch (e) {
        console.error('Error fetching cached permit', e)

        return undefined
      }
    },
    [getCachedPermit, chainId, account, provider]
  )
}
