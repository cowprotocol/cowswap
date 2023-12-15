import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { checkIsCallDataAValidPermit, getPermitUtilsInstance, PermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import { getAppDataHooks } from 'modules/appData'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { useGetPermitInfo } from './useGetPermitInfo'
import { usePreGeneratedPermitInfo } from './usePreGeneratedPermitInfo'

import { CheckHasValidPendingPermit } from '../types'

/**
 * TODO: there are some duplicated code between this and usePermitInfo.ts
 */
export function useCheckHasValidPendingPermit(): CheckHasValidPendingPermit {
  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()
  const getPermitInfo = useGetPermitInfo(chainId)
  const { allPermitInfo, isLoading: preGeneratedIsLoading } = usePreGeneratedPermitInfo()

  return useCallback(
    async (order: ParsedOrder): Promise<boolean | undefined> => {
      if (!provider || preGeneratedIsLoading) {
        // Missing required params, we can't tell
        return undefined
      }

      const tokenAddress = order.inputToken.address.toLowerCase()

      const permitInfo = getPermitInfo(tokenAddress)
      const preGeneratedPermitInfo = allPermitInfo[tokenAddress]

      // If the token is not supported, we can say that there is no valid permit
      if (preGeneratedPermitInfo?.type === 'unsupported') {
        return false
      }

      if (permitInfo === undefined) {
        // Missing permit info, we can't tell
        return undefined
      }

      return checkHasValidPendingPermit(order, provider, chainId, permitInfo)
    },
    [chainId, getPermitInfo, provider, preGeneratedIsLoading, allPermitInfo]
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
  const tokenName = order.inputToken.name

  const checkedHooks = await Promise.all(
    preHooks.map(({ callData }) =>
      checkIsCallDataAValidPermit(order.owner, chainId, eip2162Utils, tokenAddress, tokenName, callData, permitInfo)
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
