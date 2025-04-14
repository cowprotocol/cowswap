import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/cow-sdk'
import {
  generatePermitHook,
  getPermitUtilsInstance,
  isSupportedPermitInfo,
  PermitHookData,
} from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useGetCachedPermit } from './useGetCachedPermit'

import { staticPermitCacheAtom, storePermitCacheAtom, userPermitCacheAtom } from '../state/permitCacheAtom'
import { GeneratePermitHook, GeneratePermitHookParams } from '../types'

/**
 * Hook that returns callback to generate permit hook data
 */
export function useGeneratePermitHook(): GeneratePermitHook {
  const { chainId } = useWalletInfo()
  const storePermit = useSetAtom(storePermitCacheAtom)
  const getCachedPermit = useGetCachedPermit()

  // Warming up stored atoms
  //
  // For some reason, atoms start always in the default state (`{}`) on load,
  // even if localStorage contains data, wiping previously saved data.
  // Here we force an individual read of each atom, which does populate them properly
  useAtomValue(staticPermitCacheAtom)
  useAtomValue(userPermitCacheAtom)

  const provider = useWalletProvider()

  return useCallback(
    async (params: GeneratePermitHookParams): Promise<PermitHookData | undefined> => {
      const { inputToken, account, permitInfo, customSpender } = params

      if (!provider || !isSupportedPermitInfo(permitInfo)) {
        return
      }

      const eip2612Utils = getPermitUtilsInstance(chainId, provider, account)
      const spender = customSpender || COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

      // Always get the nonce for the real account, to know whether the cache should be invalidated
      // Static account should never need to pre-check the nonce as it'll never change once cached
      const nonce = account ? await eip2612Utils.getTokenNonce(inputToken.address, account) : undefined

      const permitParams = { chainId, tokenAddress: inputToken.address, account, nonce }

      const cachedPermit = await getCachedPermit(inputToken.address, spender)

      if (cachedPermit) {
        return cachedPermit
      }

      const hookData = await generatePermitHook({
        chainId,
        inputToken,
        spender,
        provider,
        permitInfo,
        eip2612Utils,
        account,
        nonce,
      })

      hookData && storePermit({ ...permitParams, hookData, spender })

      return hookData
    },
    [provider, chainId, getCachedPermit, storePermit],
  )
}
