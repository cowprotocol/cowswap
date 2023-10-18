import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import { DAI_PERMIT_SELECTOR, Eip2612PermitUtils, EIP_2612_PERMIT_SELECTOR } from '@1inch/permit-signed-approvals-utils'

import { getAppDataHooks } from 'modules/appData'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { useGetPermitInfo } from './useGetPermitInfo'

import { CheckHasValidPendingPermit, PermitInfo, SupportedPermitInfo } from '../types'
import { fixTokenName } from '../utils/fixTokenName'
import { getPermitUtilsInstance } from '../utils/getPermitUtilsInstance'

export function useCheckHasValidPendingPermit(): CheckHasValidPendingPermit {
  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()
  const getPermitInfo = useGetPermitInfo(chainId)

  return useCallback(
    async (order: ParsedOrder): Promise<boolean | undefined> => {
      if (!provider) {
        // Missing required params, we can't tell
        return undefined
      }

      const permitInfo = getPermitInfo(order.inputToken.address)

      if (permitInfo === undefined) {
        // Missing permit info, we can't tell
        return undefined
      }

      return checkHasValidPendingPermit(order, provider, chainId, permitInfo)
    },
    [chainId, provider]
  )
}

async function checkHasValidPendingPermit(
  order: ParsedOrder,
  provider: Web3Provider,
  chainId: SupportedChainId,
  permitInfo: PermitInfo
): Promise<boolean> {
  const { fullAppData, partiallyFillable, executionData } = order
  const preHooks = getAppDataHooks(fullAppData)?.pre

  if (
    // No hooks === no permit
    !preHooks ||
    // Permit is only executed for partially fillable orders in the first execution
    // Thus, if there is any amount executed, partiallyFillable permit is no longer valid
    (partiallyFillable && executionData.filledAmount.gt('0')) ||
    // Permit not supported, shouldn't even get this far
    !permitInfo
  ) {
    // These cases we know for sure permit isn't valid or there is no permit
    return false
  }

  const eip2162Utils = getPermitUtilsInstance(chainId, provider, order.owner)

  const tokenAddress = order.inputToken.address
  const tokenName = order.inputToken.name || tokenAddress

  const checkedHooks = await Promise.all(
    preHooks.map(({ callData }) =>
      checkIsSingleCallDataAValidPermit(order, chainId, eip2162Utils, tokenAddress, tokenName, callData, permitInfo)
    )
  )

  const validPermits = checkedHooks.filter((v) => v !== undefined)

  if (!validPermits.length) {
    // No permits means no preHook permits, we can say that there is no valid permit
    return false
  }

  // Only when all permits are valid, then the order permits are still valid
  return validPermits.every(Boolean)
}

async function checkIsSingleCallDataAValidPermit(
  order: ParsedOrder,
  chainId: SupportedChainId,
  eip2162Utils: Eip2612PermitUtils,
  tokenAddress: string,
  tokenName: string,
  callData: string,
  { version }: SupportedPermitInfo
): Promise<boolean | undefined> {
  const params = { chainId, tokenName: fixTokenName(tokenName), tokenAddress, callData, version }

  let recoverPermitOwnerPromise: Promise<string> | undefined = undefined

  // If pre-hook doesn't start with either selector, it's not a permit
  if (callData.startsWith(EIP_2612_PERMIT_SELECTOR)) {
    recoverPermitOwnerPromise = eip2162Utils.recoverPermitOwnerFromCallData({
      ...params,
      // I don't know why this was removed, ok?
      // We added it back on buildPermitCallData.ts
      // But it looks like this is needed 🤷
      // Check the test for this method https://github.com/1inch/permit-signed-approvals-utils/blob/master/src/eip-2612-permit.test.ts#L85-L106
      callData: callData.replace(EIP_2612_PERMIT_SELECTOR, '0x'),
    })
  } else if (callData.startsWith(DAI_PERMIT_SELECTOR)) {
    recoverPermitOwnerPromise = eip2162Utils.recoverDaiLikePermitOwnerFromCallData({
      ...params,
      callData: callData.replace(DAI_PERMIT_SELECTOR, '0x'),
    })
  }

  if (!recoverPermitOwnerPromise) {
    // The callData doesn't match any known permit type
    return undefined
  }

  try {
    const recoveredOwner = await recoverPermitOwnerPromise

    // Permit is valid when recovered owner matches order owner
    return recoveredOwner.toLowerCase() === order.owner.toLowerCase()
  } catch (e) {
    console.debug(
      `[checkHasValidPendingPermit] Failed to check permit validity for order ${order.id} with callData ${callData}`,
      e
    )
    return false
  }
}
