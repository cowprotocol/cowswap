import { encodeFunctionData, type Hex } from 'viem'

import type { EvmCall, SupportedChainId } from '@cowprotocol/cow-sdk'
import { COW_SHED_2_1_0_VERSION, CowShedSdk, type ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG } from 'modules/accountProxy'

const COW_SHED_CALL_COMPONENTS = [
  { internalType: 'address', name: 'target', type: 'address' },
  { internalType: 'uint256', name: 'value', type: 'uint256' },
  { internalType: 'bytes', name: 'callData', type: 'bytes' },
  { internalType: 'bool', name: 'allowFailure', type: 'bool' },
  { internalType: 'bool', name: 'isDelegateCall', type: 'bool' },
] as const

const TRUSTED_EXECUTE_HOOKS_ABI = [
  {
    inputs: [
      {
        components: COW_SHED_CALL_COMPONENTS,
        internalType: 'struct Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'trustedExecuteHooks',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export interface BuildEoaTwapTrustedExecuteTxParams {
  proxyAddress: `0x${string}`
  chainId: SupportedChainId
  calls: ICoWShedCall[]
  isProxyDeployed: boolean
}

type TrustedExecuteHooksCall = {
  target: `0x${string}`
  value: bigint
  callData: Hex
  allowFailure: boolean
  isDelegateCall: boolean
}

/**
 * Builds the single setup transaction for EOA TWAP:
 * - Deployed proxy: EOA (admin) calls `trustedExecuteHooks` on the cow-shed.
 * - New proxy: the factory deploys the proxy and executes hooks atomically.
 */
export function buildEoaTwapTrustedExecuteTx({
  proxyAddress,
  chainId,
  calls,
  isProxyDeployed,
}: BuildEoaTwapTrustedExecuteTxParams): EvmCall {
  if (isProxyDeployed) {
    return {
      to: proxyAddress,
      data: encodeTrustedExecuteHooksCalldata(calls),
      value: 0n,
    }
  }

  return new CowShedSdk(
    undefined,
    ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG.factoryOptions,
    COW_SHED_2_1_0_VERSION,
  ).encodeExecuteOwnHooks({ calls, chainId })
}

export function encodeTrustedExecuteHooksCalldata(calls: ICoWShedCall[]): Hex {
  return encodeFunctionData({
    abi: TRUSTED_EXECUTE_HOOKS_ABI,
    functionName: 'trustedExecuteHooks',
    // ICoWShedCall uses plain `string` for target/callData; viem expects branded address/Hex.
    args: [calls as TrustedExecuteHooksCall[]],
  })
}
