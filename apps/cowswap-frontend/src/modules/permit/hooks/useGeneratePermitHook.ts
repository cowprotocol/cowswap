import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  generatePermitHook,
  getPermitUtilsInstance,
  isSupportedPermitInfo,
  PermitHookData,
} from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { maxUint256 } from 'viem'
import { usePublicClient, useConfig } from 'wagmi'

import { useGetCachedPermit } from './useGetCachedPermit'

import { staticPermitCacheAtom, storePermitCacheAtom, userPermitCacheAtom } from '../state/permitCacheAtom'
import { GeneratePermitHook, GeneratePermitHookParams } from '../types'

type PermitDeps = {
  config: ReturnType<typeof useConfig>
  publicClient: ReturnType<typeof usePublicClient>
  chainId: number
  getCachedPermit: ReturnType<typeof useGetCachedPermit>
  storePermit: ReturnType<typeof useSetAtom<typeof storePermitCacheAtom>>
}

async function runPermitRequest(
  params: GeneratePermitHookParams,
  amount: bigint,
  config: PermitDeps['config'],
  publicClient: PermitDeps['publicClient'],
  chainId: number,
  getCachedPermit: PermitDeps['getCachedPermit'],
  storePermit: PermitDeps['storePermit'],
): Promise<PermitHookData | undefined> {
  if (!publicClient || !isSupportedPermitInfo(params.permitInfo)) return undefined

  const eip2612Utils = await getPermitUtilsInstance({ chainId, publicClient })
  const spender = params.customSpender || COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId as SupportedChainId]
  const nonce = params.account ? await eip2612Utils.getTokenNonce(params.inputToken.address, params.account) : undefined
  const permitParams = {
    chainId,
    tokenAddress: params.inputToken.address,
    account: params.account,
    nonce,
    amount,
  }

  const cachedPermit = await getCachedPermit(params.inputToken.address, amount, spender)
  if (cachedPermit) return cachedPermit

  params.preSignCallback?.()
  const hookData = await generatePermitHook({
    account: params.account,
    amount,
    chainId,
    config,
    eip2612Utils,
    inputToken: params.inputToken,
    nonce,
    permitInfo: params.permitInfo,
    spender,
  })
  if (hookData) {
    params.postSignCallback?.()
    storePermit({ ...permitParams, hookData, spender })
  }
  return hookData
}

/**
 * Hook that returns callback to generate permit hook data
 */
export function useGeneratePermitHook(): GeneratePermitHook {
  const config = useConfig()
  const publicClient = usePublicClient()
  const { chainId } = useWalletInfo()
  const storePermit = useSetAtom(storePermitCacheAtom)
  const getCachedPermit = useGetCachedPermit()

  useAtomValue(staticPermitCacheAtom)
  useAtomValue(userPermitCacheAtom)

  return useCallback(
    (params: GeneratePermitHookParams) =>
      runPermitRequest(
        params,
        params.amount ?? maxUint256,
        config,
        publicClient,
        chainId,
        getCachedPermit,
        storePermit,
      ),
    [config, publicClient, chainId, getCachedPermit, storePermit],
  )
}
