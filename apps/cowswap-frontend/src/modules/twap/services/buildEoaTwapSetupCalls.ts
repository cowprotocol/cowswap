import { encodeFunctionData, erc20Abi, maxUint256 } from 'viem'

import type { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { getCreateTwapOrderCalldata } from './getTwapCreateCalldata'

import { ConditionalOrderParams } from '../types'
import { ComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'

export interface BuildEoaTwapSetupCallsParams {
  sellTokenAddress: string
  vaultRelayerAddress: string
  composableCowContract: ComposableCowContractData
  currentBlockFactoryAddress: string
  paramsStruct: ConditionalOrderParams
  /** When true, prepend max approval of sell token for the vault relayer. */
  needsApproval: boolean
  needsZeroApproval: boolean
}

/**
 * Cow-shed multicall that runs after the sell=buy funding order fills:
 * optionally approve vault relayer, then register the TWAP on ComposableCow (owner = shed).
 */
export function buildEoaTwapSetupCalls({
  sellTokenAddress,
  vaultRelayerAddress,
  composableCowContract,
  currentBlockFactoryAddress,
  paramsStruct,
  needsApproval,
  // TODO: To be implemented
  needsZeroApproval,
}: BuildEoaTwapSetupCallsParams): ICoWShedCall[] {

  const createCall: ICoWShedCall = {
    target: composableCowContract.address,
    callData: getCreateTwapOrderCalldata({
      composableCowContractAbi: composableCowContract.abi,
      paramsStruct,
      currentBlockFactoryAddress,
    }),
    value: 0n,
    isDelegateCall: false,
    allowFailure: false,
  }

  if (!needsApproval) {
    return [createCall]
  }

  const approveCallData = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    // TODO: See useTradeSpenderAddress
    args: [vaultRelayerAddress as `0x${string}`, maxUint256],
  })

  return [
    {
      target: sellTokenAddress,
      callData: approveCallData,
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    },
    createCall,
  ]
}
