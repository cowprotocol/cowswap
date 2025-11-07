import type { LatestAppDataDocVersion } from '@cowprotocol/cow-sdk'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import { isPermitDecodedCalldataValid } from './isPermitValidForOrder'
import { ParsedOrder } from './parseOrder'

export function getOrderPermitAmount(chainId: SupportedChainId, order: ParsedOrder): BigNumber | null {
  if (!order.fullAppData) return null

  try {
    const appData: LatestAppDataDocVersion = JSON.parse(order.fullAppData)
    const preHooks = appData.metadata.hooks?.pre

    if (!preHooks) return null

    for (const hook of preHooks) {
      const validation = isPermitDecodedCalldataValid(hook.callData, chainId, order.owner)

      if (validation.isValid && validation.amount) {
        return validation.amount
      }
    }

    return null
  } catch {
    return null
  }
}
