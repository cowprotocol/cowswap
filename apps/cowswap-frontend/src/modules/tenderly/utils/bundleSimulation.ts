import { Erc20 } from '@cowprotocol/abis'
import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import { CowHook } from 'modules/hooksStore/types/hooks'

import { SimulationData, SimulationInput } from '../types'

export interface GetTransferTenderlySimulationInput {
  currencyAmount: string
  from: string
  receiver: string
  token: Erc20
}

export type TokenBuyTransferInfo = {
  sender: string
  amount: string
}[]
export interface PostBundleSimulationParams {
  account: string
  chainId: SupportedChainId
  tokenSell: Erc20
  tokenBuy: Erc20
  preHooks: CowHookDetails[]
  postHooks: CowHookDetails[]
  sellAmount: string
  orderReceiver: string
  tokenBuyTransferInfo: TokenBuyTransferInfo
}

export const completeBundleSimulation = async (params: PostBundleSimulationParams): Promise<SimulationData[]> => {
  const input = getBundleTenderlySimulationInput(params)
  return simulateBundle(input, params.chainId)
}

export const preHooksBundleSimulation = async (
  params: Pick<PostBundleSimulationParams, 'chainId' | 'preHooks'>,
): Promise<SimulationData[]> => {
  const input = params.preHooks.map((hook) =>
    getCoWHookTenderlySimulationInput(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[params.chainId], hook.hook),
  )
  return simulateBundle(input, params.chainId)
}

const simulateBundle = async (input: SimulationInput[], chainId: SupportedChainId): Promise<SimulationData[]> => {
  const response = await fetch(`${BFF_BASE_URL}/${chainId}/simulation/simulateBundle`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())

  return response as SimulationData[]
}

export function getCoWHookTenderlySimulationInput(from: string, params: CowHook): SimulationInput {
  return {
    input: params.callData,
    to: params.target,
    from,
  }
}

export function getTransferTenderlySimulationInput({
  currencyAmount,
  from,
  receiver,
  token,
}: GetTransferTenderlySimulationInput): SimulationInput {
  const callData = token.interface.encodeFunctionData('transfer', [receiver, currencyAmount])

  return {
    input: callData,
    to: token.address,
    from,
  }
}

export function getBundleTenderlySimulationInput({
  account,
  chainId,
  tokenSell,
  tokenBuy,
  preHooks,
  postHooks,
  sellAmount,
  orderReceiver,
  tokenBuyTransferInfo,
}: PostBundleSimulationParams): SimulationInput[] {
  const settlementAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]
  const preHooksSimulations = preHooks.map((hook) => getCoWHookTenderlySimulationInput(settlementAddress, hook.hook))
  const postHooksSimulations = postHooks.map((hook) => getCoWHookTenderlySimulationInput(settlementAddress, hook.hook))

  // If there are no post hooks, we don't need to simulate the transfer
  if (postHooks.length === 0) return preHooksSimulations

  const sellTokenTransfer = getTransferTenderlySimulationInput({
    currencyAmount: sellAmount,
    from: account,
    receiver: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
    token: tokenSell,
  })

  const buyTokenTransfers = tokenBuyTransferInfo.map((transferInfo) =>
    getTransferTenderlySimulationInput({
      currencyAmount: transferInfo.amount,
      from: transferInfo.sender,
      receiver: postHooks[0].recipientOverride || orderReceiver,
      token: tokenBuy,
    }),
  )

  return [...preHooksSimulations, sellTokenTransfer, ...buyTokenTransfers, ...postHooksSimulations]
}
