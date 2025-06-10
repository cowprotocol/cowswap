import { getBlockExplorerUrl } from '@cowprotocol/common-utils'

import BigNumber from 'bignumber.js'

import { getContractTrades, getTokenAddress } from './nodesBuilder'
import { Accounts, Dict, Settlement } from './types'

import { Order } from '../../../api/operator'
import { accountAddressesInvolved, getAliasFromAddress, PublicTrade, Transfer } from '../../../api/tenderly'
import { TransactionData } from '../../../hooks/useTransactionData'
import { SingleErc20State } from '../../../state/erc20'
import { Network } from '../../../types'
import { abbreviateString } from '../../../utils'


/**
 * Group transfers by token, from and to
 */
function groupTransfers(arr: Transfer[]): Transfer[] {
  return [
    ...arr
      .reduce((r, t) => {
        const key = `${t.token}-${t.from}-${t.to}`

        const item =
          r.get(key) ||
          Object.assign({}, t, {
            value: new BigNumber(0),
          })

        item.value = BigNumber.sum(new BigNumber(item.value), new BigNumber(t.value)).toString()

        return r.set(key, item)
      }, new Map<string, Transfer>())
      .values(),
  ]
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function buildTransfersBasedSettlement(params: BuildSettlementParams): Settlement | undefined {
  const { networkId, orders, txData, tokens, trades, transfers } = params
  const { trace, contracts } = txData

  if (!networkId || !orders || !trace || !contracts) {
    return undefined
  }

  const _accounts: Accounts = Object.fromEntries(accountAddressesInvolved(contracts, trades, transfers))
  const filteredOrders = orders.filter((order) => _accounts[order.owner])

  const ownersAndReceivers = filteredOrders.reduce<Set<string>>((_set, { owner, receiver }) => {
    _set.add(owner)
    _set.add(receiver)

    return _set
  }, new Set<string>())

  const groupedTransfers = groupTransfers(transfers)
  const transfersWithKind: Transfer[] = groupedTransfers.filter(
    (transfer) => !ownersAndReceivers.has(transfer.from) && !ownersAndReceivers.has(transfer.to)
  )
  filteredOrders?.forEach((order) => {
    const { owner, kind, receiver } = order
    if (!ownersAndReceivers.has(owner)) return
    transfersWithKind.push(
      ...groupedTransfers.filter((t) => [t.from, t.to].includes(owner)).map((transfer) => ({ ...transfer, kind }))
    )

    transfersWithKind.push(
      ...groupedTransfers.filter((t) => [t.from, t.to].includes(receiver)).map((transfer) => ({ ...transfer, kind }))
    )
    ownersAndReceivers.delete(owner)
    ownersAndReceivers.delete(receiver)
  })

  const accountsWithReceiver = _accounts

  filteredOrders.forEach((order) => {
    if (!(order.receiver in _accounts)) {
      accountsWithReceiver[order.receiver] = {
        alias: getAliasFromAddress(order.receiver),
        address: order.receiver,
      }
    }
    accountsWithReceiver[order.receiver] = {
      ...accountsWithReceiver[order.receiver],
      owner: order.owner,
    }
  })
  Object.values(accountsWithReceiver).forEach((account) => {
    if (account.address) account.href = getBlockExplorerUrl(networkId, 'address', account.address)
  })

  const tokenAddresses = transfersWithKind.map((transfer: Transfer): string => transfer.token)
  const accounts = accountsWithReceiver

  const filteredTokens = Object.keys(tokens).reduce((acc, token) => {
    if (tokenAddresses.includes(token)) {
      acc[token] = tokens[token]
    }
    return acc
  }, {})

  return {
    transfers: transfersWithKind,
    tokens: filteredTokens,
    trades,
    accounts,
  }
}

export type BuildSettlementParams = {
  networkId: Network | undefined
  tokens: Dict<SingleErc20State>
  orders?: Order[] | undefined
  txData: TransactionData
  trades: PublicTrade[]
  transfers: Transfer[]
}

export function buildTradesBasedSettlement(params: BuildSettlementParams): Settlement | undefined {
  const { networkId, txData, tokens, orders, trades, transfers } = params
  const { trace, contracts } = txData

  if (!networkId || !trace || !contracts) {
    return undefined
  }

  const contractTrades = getContractTrades(trades, transfers, orders)

  const addressesSet = transfers.reduce((set, transfer) => {
    set.add(getTokenAddress(transfer.token, networkId || 1))
    return set
  }, new Set<string>())

  const tokenAddresses = Array.from(addressesSet)

  const accounts = tokenAddresses.reduce((acc, address) => {
    const symbol = tokens?.[address]?.symbol

    acc[address] = {
      alias: symbol || abbreviateString(address, 6, 4),
      address,
      href: getBlockExplorerUrl(networkId, 'token', address),
    }

    return acc
  }, {})

  const filteredTokens = tokenAddresses.reduce((acc, address) => {
    const token = tokens[address]

    if (token) {
      acc[address] = token
    }

    return acc
  }, {})

  return {
    accounts,
    trades,
    contractTrades,
    transfers,
    tokens: filteredTokens,
    contracts,
  }
}
