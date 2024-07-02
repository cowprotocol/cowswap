import { Command } from '@cowprotocol/types'

import { ElementDefinition, LayoutOptions } from 'cytoscape'

import { Account, Contract, Trade, Transfer } from '../../../api/tenderly'
import { SingleErc20State } from '../../../state/erc20'
import { Network } from '../../../types'


export enum TypeNodeOnTx {
  NetworkNode = 'networkNode',
  CowProtocol = 'cowProtocol',
  Trader = 'trader',
  Dex = 'dex',
  Special = 'special',
  Token = 'token',
  Hyper = 'hyper',
}

export enum TypeEdgeOnTx {
  sellEdge = 'sell',
  buyEdge = 'buy',
  noKind = 'noKind',
  user = 'user',
  amm = 'amm',
}

export type InfoTooltip = Record<string, string>

export type NodeType<T extends string, E> = { type: T; entity: E; id: string }
export type Node =
  | NodeType<TypeNodeOnTx.NetworkNode, Account>
  | NodeType<TypeNodeOnTx.CowProtocol, Account>
  | NodeType<TypeNodeOnTx.Trader, Account>
  | NodeType<TypeNodeOnTx.Dex, Account>
  | NodeType<TypeNodeOnTx.Special, Account>
  | NodeType<TypeNodeOnTx.Token, Account>
  | NodeType<TypeNodeOnTx.Hyper, Account>

export enum ViewType {
  TRANSFERS,
  TRADES,
}

export type CytoscapeLayouts = 'grid' | 'klay' | 'fcose' | 'circle' | 'concentric'

export type CustomLayoutOptions = LayoutOptions & {
  [key: string]: unknown
}

export enum LayoutNames {
  grid = 'Grid',
  klay = 'KLay',
  fcose = 'FCoSE',
  circle = 'Circle',
  concentric = 'Concentric',
}

export type BuildNodesFn = (
  txSettlement: Settlement,
  networkId: Network,
  heightSize: number,
  layout: string
) => ElementDefinition[]

export type ContractTrade = {
  address: string
  sellTransfers: Transfer[]
  buyTransfers: Transfer[]
}

export type TokenNode = {
  address: string
  isHyperNode?: boolean
}

export type TokenEdge = {
  from: string
  to: string
  address: string
  trade?: Trade
  fromTransfer?: Transfer
  toTransfer?: Transfer
  hyperNode?: 'from' | 'to'
}

export type NodesAndEdges = {
  nodes: TokenNode[]
  edges: TokenEdge[]
}

export type Dict<T> = Record<string, T>

export type AccountWithReceiver = Account & { owner?: string; uids?: string[] }
export type Accounts = Dict<AccountWithReceiver> | undefined

export interface Settlement {
  tokens: Dict<SingleErc20State>
  accounts: Accounts
  transfers: Array<Transfer>
  trades: Array<Trade>
  // TODO: this is a big mix of types, refactor!!!
  contractTrades?: Array<ContractTrade>
  contracts?: Array<Contract>
}

export type GetTxBatchTradesResult = {
  txSettlement: Settlement | undefined
  error: string
  isLoading: boolean
}

export interface PopperInstance {
  scheduleUpdate: Command
  destroy: Command
}
