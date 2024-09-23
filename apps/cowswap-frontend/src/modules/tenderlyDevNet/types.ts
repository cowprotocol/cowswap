import { Erc20 } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { CowHook } from 'modules/appData/types'
import { HookDappOrderParams } from 'modules/hooksStore/types/hooks'

export interface GetSettlementBalanceCacheParams {
  tokenAddress: string
  chainId: SupportedChainId
}

export interface StoreSettlementBalanceCacheParams extends GetSettlementBalanceCacheParams {
  balance: string
}

export interface TenderlySimulatePayload {
  data: string
  to: string
  from: string
}

export interface GetTransferTenderlySimulationInput {
  currencyAmount: CurrencyAmount<Currency>
  from: string
  receiver: string
  token: Erc20
  overrideBalance?: boolean
}

export interface BundleTenderlySimulationParams {
  preHooks: CowHook[]
  postHooks: CowHook[]
  orderParams: HookDappOrderParams
}

// generated
export type TenderlyBundleSimulationResponse = Array<{
  status: boolean
  gasUsed: string
  cumulativeGasUsed: string
  blockNumber: string
  type: string
  logsBloom: string
  logs: Array<{
    name: string
    anonymous: boolean
    inputs: Array<{
      value: string
      type: string
      name: string
      indexed: boolean
    }>
    raw: {
      address: string
      topics: string[]
      data: string
    }
  }>
  trace: Array<{
    type: string
    from: string
    to: string
    gas: string
    gasUsed: string
    value: string
    input: string
    error?: string
    decodedInput: Array<{
      value: string
      type: string
      name: string
      indexed: boolean
    }>
    method: string
    output: string
    decodedOutput?: Array<{
      value: boolean
      type: string
      indexed: boolean
    }>
    subtraces: number
    traceAddress: any[]
  }>
  assetChanges?: Array<{
    assetInfo: {
      standard: string
      type: string
      contractAddress: string
      symbol: string
      name: string
      logo: string
      decimals: number
      dollarValue: string
    }
    type: string
    from?: string
    to: string
    rawAmount: string
    amount: string
    dollarValue: string
  }>
  balanceChanges?: Array<{
    address: string
    dollarValue: string
    transfers: number[]
  }>
  stateChanges: Array<{
    address: string
    storage?: Array<{
      slot: string
      previousValue: string
      newValue: string
    }>
    nonce?: {
      previousValue: string
      newValue: string
    }
  }>
}>
