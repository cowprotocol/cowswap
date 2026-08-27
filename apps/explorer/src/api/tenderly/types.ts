import { RawTrade, RawOrder } from 'api/operator'

export interface Account {
  alias: string
  address?: string
  href?: string
}

export interface Contract {
  address: string
  contract_name: string
}

export interface Input {
  value: string
}

export interface Log {
  name: TypeOfTrace
  raw: Raw
  inputs: Array<Input>
}

export type PublicTrade = Pick<RawTrade, 'owner' | 'sellToken' | 'buyToken' | 'sellAmount' | 'buyAmount' | 'orderUid'> &
  Pick<RawOrder, 'feeAmount'>

export interface Raw {
  address: string
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

export interface Transfer {
  from: string
  to: string
  value: string
  token: string
  isInternal?: boolean
}

export interface TxTradesAndTransfers {
  trades: PublicTrade[]
  transfers: Transfer[]
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

export enum IndexTransferInput {
  from,
  to,
  value,
}

export enum TypeOfTrace {
  TRANSFER = 'Transfer',
  TRADE = 'Trade',
}
