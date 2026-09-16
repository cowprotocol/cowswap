import { encodeFunctionData, type Hex } from 'viem'

import type { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

/** Canonical Multicall3 address (CREATE2, same on supported EVM chains). */
export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const

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

const INITIALIZE_PROXY_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'initializeProxy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

const MULTICALL3_AGGREGATE_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct Multicall3.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate',
    outputs: [
      { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
      { internalType: 'bytes[]', name: 'returnData', type: 'bytes[]' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

export interface BuildEoaTwapTrustedExecuteTxParams {
  account: `0x${string}`
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
 * - New proxy: Multicall3 batches `initializeProxy` on the factory, then `trustedExecuteHooks` on the proxy.
 */
export function buildEoaTwapTrustedExecuteTx({
  account,
  proxyAddress,
  factoryAddress,
  calls,
  isProxyDeployed,
}: BuildEoaTwapTrustedExecuteTxParams): EoaTwapTrustedExecuteTx {
  const trustedExecuteCalldata = encodeTrustedExecuteHooksCalldata(calls)

  if (isProxyDeployed) {
    return {
      to: proxyAddress,
      data: trustedExecuteCalldata,
    }
  }

  const initializeProxyCalldata = encodeFunctionData({
    abi: INITIALIZE_PROXY_ABI,
    functionName: 'initializeProxy',
    args: [account],
  })

  return {
    to: MULTICALL3_ADDRESS,
    data: encodeFunctionData({
      abi: MULTICALL3_AGGREGATE_ABI,
      functionName: 'aggregate',
      args: [
        [
          { target: factoryAddress, callData: initializeProxyCalldata },
          { target: proxyAddress, callData: trustedExecuteCalldata },
        ],
      ],
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
