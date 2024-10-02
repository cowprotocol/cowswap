import { Erc20 } from '@cowprotocol/abis'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { BigNumberish } from 'ethers'

import { CowHook, HookDappOrderParams } from 'modules/hooksStore/types/hooks'

import { TENDERLY_API_BASE_ENDPOINT, TENDERLY_API_KEY } from '../const'
import { SimulationError, TenderlyBundleSimulationResponse, TenderlySimulatePayload } from '../types'

export interface GetTransferTenderlySimulationInput {
  currencyAmount: CurrencyAmount<Currency>
  from: string
  receiver: string
  token: Erc20
  chainId: SupportedChainId
  slotOverride?: string
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
  preHooks: CowHook[]
  postHooks: CowHook[]
  orderParams: HookDappOrderParams
  tokenBuyTransferInfo: TokenBuyTransferInfo
}

export const bundleSimulation = async (
  params: PostBundleSimulationParams,
): Promise<TenderlyBundleSimulationResponse | SimulationError> => {
  const input = getBundleTenderlySimulationInput(params)
  console.log({ TENDERLY_API_KEY })
  const response = await fetch(`${TENDERLY_API_BASE_ENDPOINT}/simulate-bundle`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: {
      'X-Access-Key': TENDERLY_API_KEY,
    },
  }).then((res) => res.json())

  return response as TenderlyBundleSimulationResponse | SimulationError
}

export function getCoWHookTenderlySimulationInput(
  from: string,
  params: CowHook,
  chainId: SupportedChainId,
): TenderlySimulatePayload {
  return {
    input: params.callData,
    to: params.target,
    gas: +params.gasLimit,
    from,
    gas_price: '0',
    network_id: chainId.toString(),
    save: true,
    save_if_fails: true,
  }
}
// TODO: check if there is a function to do this conversion
function currencyAmountToBigNumberish(amount: CurrencyAmount<Currency>): BigNumberish {
  // CurrencyAmount already stores the amount as a fraction internally
  const fraction = amount.asFraction

  // Get the numerator and denominator as BigInts
  const numerator = BigInt(fraction.numerator.toString())
  const denominator = BigInt(fraction.denominator.toString())

  // Get the decimals of the currency
  const decimals = BigInt(amount.currency.decimals)

  // Perform the division
  const scaledNumerator = numerator * 10n ** decimals
  const result = scaledNumerator / denominator

  // Convert the result to a string
  return result.toString()
}

export function getTransferTenderlySimulationInput({
  currencyAmount,
  from,
  receiver,
  token,
  chainId,
}: GetTransferTenderlySimulationInput): TenderlySimulatePayload {
  const callData = token.interface.encodeFunctionData('transfer', [
    receiver,
    currencyAmountToBigNumberish(currencyAmount),
  ])

  return {
    input: callData,
    to: token.address,
    gas: 100000, // TODO: this should be calculated based on the token
    from,
    gas_price: '0',
    network_id: chainId.toString(),
    save: true,
    save_if_fails: true,
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
}: PostBundleSimulationParams): { simulations: TenderlySimulatePayload[] } {
  const settlementAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]
  console.log({ settlementAddress })
  const preHooksSimulations = preHooks.map((hook) =>
    getCoWHookTenderlySimulationInput(settlementAddress, hook, chainId),
  )
  const postHooksSimulations = postHooks.map((hook) =>
    getCoWHookTenderlySimulationInput(settlementAddress, hook, chainId),
  )

  const sellTokenTransfer = getTransferTenderlySimulationInput({
    currencyAmount: orderParams.sellAmount,
    from: account,
    receiver: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
    token: tokenSell,
    chainId,
  })

  const buyTokenTransfers = tokenBuyTransferInfo.map((transferInfo) =>
    getTransferTenderlySimulationInput({
      currencyAmount: transferInfo.amount,
      from: transferInfo.sender,
      receiver: account,
      token: tokenBuy,
      chainId,
    }),
  )

  return { simulations: [...preHooksSimulations, sellTokenTransfer, ...buyTokenTransfers, ...postHooksSimulations] }
}
