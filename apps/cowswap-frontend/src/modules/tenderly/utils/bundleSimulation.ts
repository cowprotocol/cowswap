import { Erc20 } from '@cowprotocol/abis'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { CowHook, HookDappOrderParams } from 'modules/hooksStore/types/hooks'

import { TENDERLY_API_BASE_ENDPOINT } from '../const'
import { SimulationError, TenderlyBundleSimulationResponse, TenderlySimulatePayload } from '../types'

export interface GetTransferTenderlySimulationInput {
  currencyAmount: CurrencyAmount<Currency>
  from: string
  receiver: string
  token: Erc20
  chainId: SupportedChainId
  slotOverride?: string
}

export interface PostBundleSimulationParams {
  account: string
  chainId: SupportedChainId
  tokenSell: Erc20
  tokenBuy: Erc20
  preHooks: CowHook[]
  postHooks: CowHook[]
  orderParams: HookDappOrderParams
  slotOverride: string
}

export const bundleSimulation = async (
  params: PostBundleSimulationParams,
): Promise<TenderlyBundleSimulationResponse | SimulationError> => {
  const response = await fetch(`${TENDERLY_API_BASE_ENDPOINT}/simulate-bundle`, {
    method: 'POST',
    body: JSON.stringify(getBundleTenderlySimulationInput(params)),
    headers: {
      'X-Access-Key': process.env.TENDERLY_API_KEY as string,
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

function currencyAmountToHexUint256(amount: CurrencyAmount<Currency>) {
  const valueAsBigInt = BigInt(amount.quotient.toString())

  let hexString = valueAsBigInt.toString(16)

  hexString = hexString.padStart(64, '0')
  return '0x' + hexString
}

export function getTransferTenderlySimulationInput({
  currencyAmount,
  from,
  receiver,
  token,
  chainId,
  slotOverride,
}: GetTransferTenderlySimulationInput): TenderlySimulatePayload {
  const callData = token.interface.encodeFunctionData('transfer', [receiver, currencyAmount.toExact()])

  const state_objects = slotOverride
    ? {
        [token.address]: {
          storage: {
            [slotOverride]: currencyAmountToHexUint256(currencyAmount),
          },
        },
      }
    : {}

  return {
    input: callData,
    to: token.address,
    gas: 100000, // TODO: this should be calculated based on the token
    from,
    gas_price: '0',
    network_id: chainId.toString(),
    save: true,
    save_if_fails: true,
    state_objects,
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
  slotOverride,
}: PostBundleSimulationParams): { simulations: TenderlySimulatePayload[] } {
  const settlementAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]
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

  const buyTokenSimulation = getTransferTenderlySimulationInput({
    currencyAmount: orderParams.sellAmount,
    from: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
    receiver: orderParams.receiver,
    token: tokenBuy,
    chainId,
    slotOverride,
  })

  return { simulations: [...preHooksSimulations, sellTokenTransfer, buyTokenSimulation, ...postHooksSimulations] }
}
