import { RawTrade, RawOrder } from 'api/operator'

export enum TypeOfTrace {
  TRANSFER = 'Transfer',
  TRADE = 'Trade',
}

export interface Trace {
  block_number: number
  contract_address: string
  contract_id: string
  created_at: string
  intrinsic_gas: number
  logs: Array<Log>
  refund_gas: number
  transaction_id: string
}

export interface Log {
  name: TypeOfTrace
  raw: Raw
  inputs: Array<Input>
}

export interface Raw {
  address: string
}

export interface Input {
  value: string
}

export interface Transfer {
  from: string
  to: string
  value: string
  token: string
  isInternal?: boolean
}

export interface Account {
  alias: string
  address?: string
  href?: string
}

export interface Contract {
  address: string
  contract_name: string
}

export type PublicTrade = Pick<RawTrade, 'owner' | 'sellToken' | 'buyToken' | 'sellAmount' | 'buyAmount' | 'orderUid'> &
  Pick<RawOrder, 'feeAmount'>

export enum IndexTransferInput {
  from,
  to,
  value,
}

export enum IndexTradeInput {
  owner,
  sellToken,
  buyToken,
  sellAmount,
  buyAmount,
  feeAmount,
  orderUid,
}

export interface TxTradesAndTransfers {
  trades: PublicTrade[]
  transfers: Transfer[]
}
