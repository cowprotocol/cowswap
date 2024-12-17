import { Erc20__factory } from '@cowprotocol/abis'
import type { LatestAppDataDocVersion } from '@cowprotocol/app-data'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import { ParsedOrder } from './parseOrder'

const erc20Interface = Erc20__factory.createInterface()

export function getOrderPermitAmount(chainId: SupportedChainId, order: ParsedOrder): BigNumber | null {
  if (!order.fullAppData) return null

  try {
    const spenderAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId].toLowerCase()
    const appData: LatestAppDataDocVersion = JSON.parse(order.fullAppData)
    const preHooks = appData.metadata.hooks?.pre

    if (!preHooks) return null

    const permitData = preHooks
      .map((hook) => {
        try {
          return erc20Interface.decodeFunctionData('permit', hook.callData)
        } catch {
          return null
        }
      })
      .find((decoded) => {
        return (
          decoded &&
          decoded.spender?.toLowerCase() === spenderAddress &&
          decoded.owner?.toLowerCase() === order.owner.toLowerCase() &&
          (decoded.deadline as BigNumber)?.toNumber() > Date.now() / 1000
        )
      })

    return permitData?.value || null
  } catch {
    return null
  }
}
