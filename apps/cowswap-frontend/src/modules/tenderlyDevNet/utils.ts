import { Erc20 } from '@cowprotocol/abis'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'

import { CowHook } from 'modules/hooksStore/types/hooks'

import { TENDERLY_TESTNET_PROVIDER } from './const'
import { BundleTenderlySimulationParams, GetTransferTenderlySimulationInput, TenderlySimulatePayload } from './types'

export function getCoWHookTenderlySimulationInput(from: string, params: CowHook): TenderlySimulatePayload {
  return {
    data: params.callData,
    to: params.target,
    from,
  }
}

export function getTransferTenderlySimulationInput({
  currencyAmount,
  from,
  receiver,
  token,
}: GetTransferTenderlySimulationInput): TenderlySimulatePayload {
  const callData = token.interface.encodeFunctionData('transfer', [receiver, currencyAmount.toExact()])

  return {
    data: callData,
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
}: {
  account: string
  chainId: SupportedChainId
  tokenSell: Erc20
  tokenBuy: Erc20
} & BundleTenderlySimulationParams): TenderlySimulatePayload[] {
  const settlementAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]
  const preHooksSimulations = preHooks.map((hook) => getCoWHookTenderlySimulationInput(settlementAddress, hook))
  const postHooksSimulations = postHooks.map((hook) => getCoWHookTenderlySimulationInput(settlementAddress, hook))

  const sellTokenTransfer = getTransferTenderlySimulationInput({
    currencyAmount: orderParams.sellAmount,
    from: account,
    receiver: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
    token: tokenSell,
  })

  const buyTokenSimulation = getTransferTenderlySimulationInput({
    currencyAmount: orderParams.sellAmount,
    from: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
    receiver: orderParams.receiver,
    token: tokenBuy,
  })

  return [...preHooksSimulations, sellTokenTransfer, buyTokenSimulation, ...postHooksSimulations]
}

export async function addErc20Balance(tokenAddress: string, account: string, balanceHex: string) {
  const result = await TENDERLY_TESTNET_PROVIDER.send('tenderly_setErc20Balance', [tokenAddress, [account], balanceHex])
  return result
}
