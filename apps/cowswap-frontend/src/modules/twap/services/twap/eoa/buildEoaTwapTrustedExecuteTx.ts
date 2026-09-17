import { bytesToHex, encodeFunctionData, type Hex } from 'viem'

import type { Signer } from '@cowprotocol/cow-sdk'
import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'
import type { CowShedHooks, ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

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
  signer: Signer
  account: `0x${string}`
  proxyAddress: `0x${string}`
  factoryAddress: `0x${string}`
  calls: ICoWShedCall[]
  isProxyDeployed: boolean
  cowShedHooks: Pick<CowShedHooks, 'signCalls' | 'encodeExecuteHooksForFactory'>
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
 * - New proxy: the factory deploys the proxy and executes signed hooks atomically.
 */
export async function buildEoaTwapTrustedExecuteTx({
  account,
  signer,
  proxyAddress,
  factoryAddress,
  calls,
  isProxyDeployed,
  cowShedHooks,
}: BuildEoaTwapTrustedExecuteTxParams): Promise<EoaTwapTrustedExecuteTx> {
  const trustedExecuteCalldata = encodeTrustedExecuteHooksCalldata(calls)

  if (isProxyDeployed) {
    return {
      to: proxyAddress,
      data: trustedExecuteCalldata,
    }
  }

  const nonce = bytesToHex(crypto.getRandomValues(new Uint8Array(32)))
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60)
  const signature = await cowShedHooks.signCalls(calls, nonce, deadline, ContractsSigningScheme.EIP712, signer)

  return {
    to: factoryAddress,
    data: cowShedHooks.encodeExecuteHooksForFactory(calls, nonce, deadline, account, signature) as Hex,
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
