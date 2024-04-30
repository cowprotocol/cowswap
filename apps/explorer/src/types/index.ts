import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TransactionReceipt } from 'web3-core'

export type AnyFunction = (...args: unknown[]) => unknown
export type Mutation<T> = (original: T) => T
export type Unpromise<T> = T extends Promise<infer U> ? U : T

export const Network = SupportedChainId
export type Network = SupportedChainId

export interface TxOptionalParams {
  onSentTransaction?: (transactionHash: string) => void
}

export type Receipt = TransactionReceipt

export enum AnalyticsDimension {
  NETWORK,
  BROWSER_TYPE,
}

export type UiError = {
  message: string
  type: 'warn' | 'error'
}

export type Errors = Record<string, UiError>
