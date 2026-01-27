import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/cow-sdk'
import { getPermitUtilsInstance, PermitHookData } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { Nullish } from 'types'

import { getPermitCacheAtom } from '../state/permitCacheAtom'

export function useGetCachedPermit(): (
  tokenAddress: Nullish<string>,
  amount?: bigint,
  customSpender?: string,
) => Promise<PermitHookData | undefined> {
  const { chainId, account } = useWalletInfo()
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()
  const getCachedPermit = useSetAtom(getPermitCacheAtom)

  return useCallback(
    async (tokenAddress: Nullish<string>, amount?: bigint, customSpender?: string) => {
      if (!provider || !account || !tokenAddress) {
        return
      }
      const spender = customSpender || COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

      try {
        const eip2612Utils = await getPermitUtilsInstance(chainId, provider, account)

        // TODO: it might add unwanted node RPC requests
        // Always get the nonce for the real account, to know whether the cache should be invalidated
        // Static account should never need to pre-check the nonce as it'll never change once cached
        const nonce = account ? await eip2612Utils.getTokenNonce(tokenAddress, account) : undefined

        const permitParams = { chainId, tokenAddress, account, nonce, spender, amount }

        return getCachedPermit(permitParams)
      } catch (e) {
        console.error('Error fetching cached permit', e)

        return undefined
      }
    },
    [getCachedPermit, chainId, account, provider],
  )
}
