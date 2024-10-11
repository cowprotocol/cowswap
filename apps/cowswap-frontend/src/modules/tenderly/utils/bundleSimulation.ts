import { Erc20 } from '@cowprotocol/abis'
import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { BigNumberish } from 'ethers'

import { CowHook, HookDappOrderParams } from 'modules/hooksStore/types/hooks'

import { SimulationData, SimulationInput } from '../types'

export interface GetTransferTenderlySimulationInput {
  currencyAmount: CurrencyAmount<Currency>
  from: string
  receiver: string
  token: Erc20
}

export type TokenBuyTransferInfo = {
  sender: string
  amount: CurrencyAmount<Currency>
}[]
export interface PostBundleSimulationParams {
  account: string
  chainId: SupportedChainId
  tokenSell: Erc20
  tokenBuy: Erc20
  preHooks: CowHookDetails[]
  postHooks: CowHookDetails[]
  orderParams: HookDappOrderParams
  tokenBuyTransferInfo: TokenBuyTransferInfo
}

export const bundleSimulation = async (params: PostBundleSimulationParams): Promise<SimulationData[]> => {
  const input = getBundleTenderlySimulationInput(params)
  const response = await fetch(`${BFF_BASE_URL}/${params.chainId}/simulation/simulateBundle`, {
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
// TODO: check if there is a function to do this conversion
function currencyAmountToBigNumberish(amount: CurrencyAmount<Currency>): BigNumberish {
  // CurrencyAmount already stores the amount as a fraction internally
  const fraction = amount.asFraction

  // Get the numerator and denominator as BigInts
  const numerator = BigInt(fraction.numerator.toString())
  const denominator = BigInt(fraction.denominator.toString())

  const result = numerator / denominator

  // Convert the result to a string
  return result.toString()
}

export function getTransferTenderlySimulationInput({
  currencyAmount,
  from,
  receiver,
  token,
}: GetTransferTenderlySimulationInput): SimulationInput {
  const callData = token.interface.encodeFunctionData('transfer', [
    receiver,
    currencyAmountToBigNumberish(currencyAmount),
  ])

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
  orderParams,
  tokenBuyTransferInfo,
}: PostBundleSimulationParams): SimulationInput[] {
  const settlementAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]
  const preHooksSimulations = preHooks.map((hook) => getCoWHookTenderlySimulationInput(settlementAddress, hook.hook))
  const postHooksSimulations = postHooks.map((hook) => getCoWHookTenderlySimulationInput(settlementAddress, hook.hook))

  // If there are no post hooks, we don't need to simulate the transfer
  if (postHooks.length === 0) return preHooksSimulations

  const receiver = postHooks[0].recipientOverride || orderParams.receiver

  const sellTokenTransfer = getTransferTenderlySimulationInput({
    currencyAmount: orderParams.sellAmount,
    from: account,
    receiver: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
    token: tokenSell,
  })

  const buyTokenTransfers = tokenBuyTransferInfo.map((transferInfo) =>
    getTransferTenderlySimulationInput({
      currencyAmount: transferInfo.amount,
      from: transferInfo.sender,
      receiver,
      token: tokenBuy,
    }),
  )

  return [...preHooksSimulations, sellTokenTransfer, ...buyTokenTransfers, ...postHooksSimulations]
}
