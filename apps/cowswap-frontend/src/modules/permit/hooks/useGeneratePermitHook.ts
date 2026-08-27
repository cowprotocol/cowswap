import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { maxUint256, type WalletClient } from 'viem'
import { usePublicClient, useConfig, useWalletClient } from 'wagmi'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  generatePermitHook,
  getPermitUtilsInstance,
  isSupportedPermitInfo,
  PermitHookData,
} from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { fireOnBeforeApprovalHook } from 'modules/injectedWidget'

import { useGetCachedPermit } from './useGetCachedPermit'

import { storePermitCacheAtom } from '../state/permitCacheAtom'
import { GeneratePermitHook, GeneratePermitHookParams } from '../types'

type PermitDeps = {
  config: ReturnType<typeof useConfig>
  publicClient: ReturnType<typeof usePublicClient>
  chainId: number
  getCachedPermit: ReturnType<typeof useGetCachedPermit>
  storePermit: ReturnType<typeof useSetAtom<typeof storePermitCacheAtom>>
  walletClient: WalletClient | undefined
}

/**
 * Hook that returns callback to generate permit hook data
 */
export function useGeneratePermitHook(): GeneratePermitHook {
  const config = useConfig()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { chainId } = useWalletInfo()
  const storePermit = useSetAtom(storePermitCacheAtom)
  const getCachedPermit = useGetCachedPermit()

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
        walletClient,
      ),
    [config, publicClient, chainId, getCachedPermit, storePermit, walletClient],
  )
}

// eslint-disable-next-line complexity
async function runPermitRequest(
  params: GeneratePermitHookParams,
  amount: bigint,
  config: PermitDeps['config'],
  publicClient: PermitDeps['publicClient'],
  chainId: number,
  getCachedPermit: PermitDeps['getCachedPermit'],
  storePermit: PermitDeps['storePermit'],
  walletClient: PermitDeps['walletClient'],
): Promise<PermitHookData | undefined> {
  if (!publicClient || !isSupportedPermitInfo(params.permitInfo)) return undefined

  const chainIdMissMatch = publicClient.chain.id !== chainId

  /**
   * Never try using eip2612Utils which instantiated with a client on one chain agains another one
   * Because getTokenNonce() will fail at the first iteration and will never get recovered
   */
  if (chainIdMissMatch) return

  const eip2612Utils = await getPermitUtilsInstance({
    chainId,
    publicClient,
    account: params.account,
    walletClient: params.account ? walletClient : undefined,
  })
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

  // Cache miss: a real permit signature is about to be requested. When a sell currency is provided
  // (i.e. this is a user-facing trade approval), give the host widget a chance to veto it first.
  // Throws WidgetHookDeclineError on decline so the calling flow aborts.
  if (params.sellCurrency && params.account) {
    await fireOnBeforeApprovalHook({
      sellCurrency: params.sellCurrency,
      sellAmount: params.amount,
      walletAddress: params.account,
      spenderAddress: spender,
    })
  }

  await params.preSignCallback?.()
  try {
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
      storePermit({ ...permitParams, hookData, spender })
    }
    return hookData
  } finally {
    params.postSignCallback?.()
  }
}
