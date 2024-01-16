import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { GP_VAULT_RELAYER } from '@cowprotocol/common-const'
import {
  generatePermitHook,
  getPermitUtilsInstance,
  isSupportedPermitInfo,
  PermitHookData,
} from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import {
  getPermitCacheAtom,
  staticPermitCacheAtom,
  storePermitCacheAtom,
  userPermitCacheAtom,
} from '../state/permitCacheAtom'
import { GeneratePermitHook, GeneratePermitHookParams } from '../types'

/**
 * Hook that returns callback to generate permit hook data
 */
export function useGeneratePermitHook(): GeneratePermitHook {
  const getCachedPermit = useSetAtom(getPermitCacheAtom)
  const storePermit = useSetAtom(storePermitCacheAtom)

  // Warming up stored atoms
  //
  // For some reason, atoms start always in the default state (`{}`) on load,
  // even if localStorage contains data, wiping previously saved data.
  // Here we force an individual read of each atom, which does populate them properly
  useAtomValue(staticPermitCacheAtom)
  useAtomValue(userPermitCacheAtom)

  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()

  const spender = GP_VAULT_RELAYER[chainId]

  return useCallback(
    async (params: GeneratePermitHookParams): Promise<PermitHookData | undefined> => {
      const { inputToken, account, permitInfo } = params

      if (!provider || !isSupportedPermitInfo(permitInfo)) {
        return
      }

      const eip2162Utils = getPermitUtilsInstance(chainId, provider, account)

      // Always get the nonce for the real account, to know whether the cache should be invalidated
      // Static account should never need to pre-check the nonce as it'll never change once cached
      const nonce = account ? await eip2162Utils.getTokenNonce(inputToken.address, account) : undefined

      const permitParams = { chainId, tokenAddress: inputToken.address, account, nonce }

      const cachedPermit = getCachedPermit(permitParams)

      if (cachedPermit) {
        return cachedPermit
      }

      const hookData = await generatePermitHook({
        chainId,
        inputToken,
        spender,
        provider,
        permitInfo,
        eip2162Utils,
        account,
        nonce,
      })

      storePermit({ ...permitParams, hookData })

      return hookData
    },
    [provider, chainId, getCachedPermit, spender, storePermit]
  )
}
