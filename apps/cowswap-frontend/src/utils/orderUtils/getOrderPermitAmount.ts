import { Erc20__factory, type Erc20Interface } from '@cowprotocol/abis'
import type { LatestAppDataDocVersion } from '@cowprotocol/app-data'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { MaxUint256 } from '@ethersproject/constants'

import {
  DAI_EIP_2612_PERMIT_ABI,
  DAI_PERMIT_SELECTOR,
  EIP_2612_PERMIT_SELECTOR,
} from '@1inch/permit-signed-approvals-utils'

import { ParsedOrder } from './parseOrder'

const erc20Interface = Erc20__factory.createInterface()
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const daiInterface = new Interface(DAI_EIP_2612_PERMIT_ABI as any) as Erc20Interface

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function getOrderPermitAmount(chainId: SupportedChainId, order: ParsedOrder): BigNumber | null {
  if (!order.fullAppData) return null

  try {
    const spenderAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId].toLowerCase()
    const appData: LatestAppDataDocVersion = JSON.parse(order.fullAppData)
    const preHooks = appData.metadata.hooks?.pre

    if (!preHooks) return null

    for (const hook of preHooks) {
      try {
        if (hook.callData.startsWith(EIP_2612_PERMIT_SELECTOR)) {
          // Check regular eip2612 permit
          const decoded = erc20Interface.decodeFunctionData('permit', hook.callData)

          if (
            decoded &&
            decoded.spender?.toLowerCase() === spenderAddress &&
            decoded.owner?.toLowerCase() === order.owner.toLowerCase() &&
            (decoded.deadline as BigNumber)?.toNumber() > Date.now() / 1000
          ) {
            return decoded.value as BigNumber
          }
        } else if (hook.callData.startsWith(DAI_PERMIT_SELECTOR)) {
          // Check dai like permit
          const decoded = daiInterface.decodeFunctionData('permit', hook.callData)

          if (
            decoded &&
            decoded.spender?.toLowerCase() === spenderAddress &&
            decoded.holder?.toLowerCase() === order.owner.toLowerCase() &&
            (decoded.expiry as BigNumber)?.toNumber() > Date.now() / 1000
          ) {
            // DAI permit has no value in the call data, so we assume it's always max approval
            return MaxUint256
          }
        }
      } catch {
        // Ignore errors, just continue to the next hook
      }
    }

    return null
  } catch {
    return null
  }
}
