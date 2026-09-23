import { encodeFunctionData, type Hex } from 'viem'

import type { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

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
  factoryAddress: `0x${string}`
  calls: ICoWShedCall[]
  isProxyDeployed: boolean
}

export interface EoaTwapTrustedExecuteTx {
  to: `0x${string}`
  data: Hex
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
  factoryAddress,
  calls,
  isProxyDeployed,
}: BuildEoaTwapTrustedExecuteTxParams): EoaTwapTrustedExecuteTx {
  if (isProxyDeployed) {
    return {
      to: proxyAddress,
      data: encodeTrustedExecuteHooksCalldata(calls),
    }
  }

  return {
    to: factoryAddress,
    data: encodeFunctionData({
      abi: [
        {
          ...TRUSTED_EXECUTE_HOOKS_ABI[0],
          name: 'executeOwnHooks',
          outputs: [{ name: 'proxy', type: 'address' }],
          stateMutability: 'payable',
        },
      ] as const,
      functionName: 'executeOwnHooks',
      args: [calls as TrustedExecuteHooksCall[]],
    }),
  }
}

export function encodeTrustedExecuteHooksCalldata(calls: ICoWShedCall[]): Hex {
  return encodeFunctionData({
    abi: TRUSTED_EXECUTE_HOOKS_ABI,
    functionName: 'trustedExecuteHooks',
    // ICoWShedCall uses plain `string` for target/callData; viem expects branded address/Hex.
    args: [calls as TrustedExecuteHooksCall[]],
  })
}
