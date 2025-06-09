import { getChainInfo } from '@cowprotocol/common-const'
import { getBlockExplorerUrl, isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'
import { ElementDefinition } from 'cytoscape'

import ElementsBuilder, { buildGridLayout } from './elementsBuilder'
import {
  BuildNodesFn,
  ContractTrade,
  NodesAndEdges,
  Settlement,
  TokenEdge,
  TokenNode,
  TypeEdgeOnTx,
  TypeNodeOnTx,
} from './types'

import { Order } from '../../../api/operator'
import { Account, ALIAS_TRADER_NAME, Trade, Transfer } from '../../../api/tenderly'
import { APP_NAME, NATIVE_TOKEN_ADDRESS_LOWERCASE, WRAPPED_NATIVE_ADDRESS } from '../../../const'
import { SingleErc20State } from '../../../state/erc20'
import { Network } from '../../../types'
import { abbreviateString, FormatAmountPrecision, formattingAmountPrecision } from '../../../utils'
import { SPECIAL_ADDRESSES, TOKEN_SYMBOL_UNKNOWN } from '../../const'

const PROTOCOL_NAME = APP_NAME
const INTERNAL_NODE_NAME = `${APP_NAME} Buffer`

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export const buildContractViewNodes: BuildNodesFn = function getNodes(
  txSettlement: Settlement,
  networkId: Network,
  heightSize: number,
  layout: string
): ElementDefinition[] {
  if (!txSettlement.accounts) return []

  const networkName = getChainInfo(networkId).label
  const networkNode = { alias: `${networkName} Liquidity` || '' }
  const builder = new ElementsBuilder(heightSize)
  builder.node({ type: TypeNodeOnTx.NetworkNode, entity: networkNode, id: networkNode.alias })

  const groupNodes: Map<string, string> = new Map()

  for (const key in txSettlement.accounts) {
    const account = txSettlement.accounts[key]
    let parentNodeName = getNetworkParentNode(account, networkNode.alias)

    const receiverNode = { alias: `${abbreviateString(account.owner || key, 4, 4)}-group` }

    if (account.owner && account.owner !== key) {
      if (!groupNodes.has(receiverNode.alias)) {
        builder.node({ type: TypeNodeOnTx.NetworkNode, entity: receiverNode, id: receiverNode.alias })
        groupNodes.set(receiverNode.alias, account.owner || key)
      }
      parentNodeName = receiverNode.alias
    }

    if (getTypeNode(account) === TypeNodeOnTx.CowProtocol) {
      builder.center({ type: TypeNodeOnTx.CowProtocol, entity: account, id: key }, parentNodeName)
    } else {
      const receivers = Object.keys(txSettlement.accounts).reduce<(string | undefined)[]>(
        (acc, key) => (txSettlement.accounts?.[key].owner ? [...acc, txSettlement.accounts?.[key].owner] : acc),
        []
      )

      if (receivers.includes(key) && account.owner !== key) {
        if (!groupNodes.has(receiverNode.alias)) {
          builder.node({ type: TypeNodeOnTx.NetworkNode, entity: receiverNode, id: receiverNode.alias })
          groupNodes.set(receiverNode.alias, account.owner || key)
        }
        parentNodeName = receiverNode.alias
      }

      builder.node(
        {
          id: key,
          type: getTypeNode(account),
          entity: showTraderAddress(account, key),
        },
        parentNodeName
      )
    }
  }

  let internalNodeCreated = false

  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  txSettlement.transfers.forEach((transfer) => {
    // Custom from id when internal transfer to avoid re-using existing node
    const fromId = transfer.isInternal ? INTERNAL_NODE_NAME : transfer.from

    // If transfer is internal and a node has not been created yet, create one
    if (transfer.isInternal && !internalNodeCreated) {
      // Set flag to prevent creating more
      internalNodeCreated = true

      const account = { alias: fromId, href: getBlockExplorerUrl(networkId, 'address', transfer.from) }
      builder.node(
        {
          type: TypeNodeOnTx.Special,
          entity: account,
          id: fromId,
        },
        // Put it inside the parent node
        getInternalParentNode(groupNodes, transfer)
      )
    }

    const kind = getKindEdge(transfer)
    const token = txSettlement.tokens[transfer.token]
    const tokenSymbol = token?.symbol || TOKEN_SYMBOL_UNKNOWN
    const tokenAmount = token?.decimals
      ? formattingAmountPrecision(new BigNumber(transfer.value), token, FormatAmountPrecision.highPrecision)
      : '-'

    const source = builder.getById(fromId)
    const target = builder.getById(transfer.to)
    builder.edge(
      { type: source?.data.type, id: fromId },
      { type: target?.data.type, id: transfer.to },
      `${tokenSymbol}`,
      kind,
      {
        from: fromId,
        // Do not display `to` field on tooltip when internal transfer as it's redundant
        ...(transfer.isInternal
          ? undefined
          : {
              to: transfer.to,
            }),
        amount: `${tokenAmount} ${tokenSymbol}`,
      }
    )
  })

  return builder.build(
    layout === 'grid'
      ? buildGridLayout(builder._countNodeTypes as Map<TypeNodeOnTx, number>, builder._center, builder._nodes)
      : undefined
  )
}

function getTypeNode(account: Account & { owner?: string }): TypeNodeOnTx {
  if (account.address && SPECIAL_ADDRESSES[account.address]) {
    return TypeNodeOnTx.Special
  } else if (account.alias === ALIAS_TRADER_NAME || account.owner) {
    return TypeNodeOnTx.Trader
  } else if (account.alias === PROTOCOL_NAME) {
    return TypeNodeOnTx.CowProtocol
  }

  return TypeNodeOnTx.Dex
}

function getKindEdge(transfer: Transfer & { kind?: OrderKind }): TypeEdgeOnTx {
  if (!transfer.kind) {
    return TypeEdgeOnTx.noKind
  }

  if (isSellOrder(transfer.kind)) {
    return TypeEdgeOnTx.sellEdge
  }

  return TypeEdgeOnTx.buyEdge
}

function showTraderAddress(account: Account, address: string): Account {
  const alias = account.alias === ALIAS_TRADER_NAME ? abbreviateString(address, 4, 4) : account.alias

  return { ...account, alias }
}

function getNetworkParentNode(account: Account, networkName: string): string | undefined {
  return account.alias !== ALIAS_TRADER_NAME ? networkName : undefined
}

function getInternalParentNode(groupNodes: Map<string, string>, transfer: Transfer): string | undefined {
  for (const [key, value] of groupNodes) {
    if (value === transfer.from) {
      return key
    }
  }
  return undefined
}

const ADDRESSES_TO_IGNORE = new Set()
// CoW Protocol settlement contract
ADDRESSES_TO_IGNORE.add('0x9008d19f58aabd9ed0d60971565aa8510560ab41')
// ETH Flow contract
ADDRESSES_TO_IGNORE.add('0x40a50cf069e992aa4536211b23f286ef88752187')

export function getContractTrades(
  trades: Trade[],
  transfers: Transfer[],
  orders: Order[] | undefined
): ContractTrade[] {
  const userAddresses = new Set<string>()
  const contractAddresses = new Set<string>()

  // Build a list of addresses that are involved in trades
  if (orders) {
    orders.forEach((order) => {
      userAddresses.add(order.owner)
      userAddresses.add(order.receiver)
    })
  } else {
    trades.forEach((trade) => userAddresses.add(trade.owner))
  }

  // Build list of contract addresses based on trades, which are not traders
  // nor part of the ignored set (CoW Protocol itself, special contracts etc)
  transfers.forEach((transfer) => {
    ;[transfer.from, transfer.to].forEach((address) => {
      if (!userAddresses.has(address) && !ADDRESSES_TO_IGNORE.has(address)) {
        contractAddresses.add(address)
      }
    })
  })

  // Get contract trades
  return Array.from(contractAddresses).map((address) => {
    const sellTransfers: Transfer[] = []
    const buyTransfers: Transfer[] = []

    transfers.forEach((transfer) => {
      if (transfer.from === address) {
        sellTransfers.push(transfer)
      } else if (transfer.to === address) {
        buyTransfers.push(transfer)
      }
    })

    return { address, sellTransfers, buyTransfers }
  })
}

function mergeContractTrade(contractTrade: ContractTrade): ContractTrade {
  const mergedSellTransfers: Transfer[] = []
  const mergedBuyTransfers: Transfer[] = []
  const token_balances: { [key: string]: bigint } = {}

  contractTrade.sellTransfers.forEach((transfer) => {
    token_balances[transfer.token] = token_balances[transfer.token]
      ? token_balances[transfer.token] - BigInt(transfer.value)
      : -BigInt(transfer.value)
  })
  contractTrade.buyTransfers.forEach((transfer) => {
    token_balances[transfer.token] = token_balances[transfer.token]
      ? token_balances[transfer.token] + BigInt(transfer.value)
      : BigInt(transfer.value)
  })

  Object.entries(token_balances).forEach(([token, amount]) => {
    if (amount < 0) {
      mergedSellTransfers.push({
        from: '', // field should not be used later on
        to: contractTrade.address,
        value: (-amount).toString(),
        token: token,
      })
    } else if (amount > 0) {
      mergedBuyTransfers.push({
        from: contractTrade.address,
        to: '',
        value: amount.toString(),
        token: token,
      })
    }
  })

  return { address: contractTrade.address, sellTransfers: mergedSellTransfers, buyTransfers: mergedBuyTransfers }
}

function isRoutingTrade(contractTrade: ContractTrade): boolean {
  return contractTrade.sellTransfers.length === 0 && contractTrade.buyTransfers.length === 0
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function getNotesAndEdges(
  userTrades: Trade[],
  contractTrades: ContractTrade[],
  networkId: SupportedChainId
): NodesAndEdges {
  const nodes: Record<string, TokenNode> = {}
  const edges: TokenEdge[] = []

  userTrades.forEach((trade) => {
    const sellToken = getTokenAddress(trade.sellToken, networkId)
    nodes[sellToken] = { address: sellToken }
    const buyToken = getTokenAddress(trade.buyToken, networkId)
    nodes[buyToken] = { address: buyToken }

    // one edge for each user trade
    edges.push({ from: sellToken, to: buyToken, address: trade.owner, trade })
  })

  contractTrades
    .map(mergeContractTrade)
    .filter((trade) => !isRoutingTrade(trade))
    .forEach((trade) => {
      // add all sellTokens from contract trades to nodes
      trade.sellTransfers.forEach(({ token }) => {
        const tokenAddress = getTokenAddress(token, networkId)
        nodes[tokenAddress] = { address: tokenAddress }
      })
      // add all buyTokens from contract trades to nodes
      trade.buyTransfers.forEach(({ token }) => {
        const tokenAddress = getTokenAddress(token, networkId)
        nodes[tokenAddress] = { address: tokenAddress }
      })

      if (trade.sellTransfers.length === 1 && trade.buyTransfers.length === 1) {
        // no need to add a new node
        // normal edge for normal contract interaction
        const sellTransfer = trade.sellTransfers[0]
        const buyTransfer = trade.buyTransfers[0]
        edges.push({
          from: getTokenAddress(sellTransfer.token, networkId),
          to: getTokenAddress(buyTransfer.token, networkId),
          address: trade.address,
          fromTransfer: sellTransfer,
          toTransfer: buyTransfer,
        })
      } else {
        // if there is more than one sellToken or buyToken, the contract becomes a node
        const nodeExists = nodes[trade.address]
        if (!nodeExists) {
          nodes[trade.address] = { address: trade.address, isHyperNode: true }
        }

        // one edge for each sellToken
        trade.sellTransfers.forEach((transfer) =>
          edges.push({
            from: getTokenAddress(transfer.token, networkId),
            to: trade.address,
            address: trade.address,
            fromTransfer: transfer,
            ...(nodeExists ? undefined : { hyperNode: 'to' }),
          })
        )
        // one edge for each buyToken
        trade.buyTransfers.forEach((transfer) =>
          edges.push({
            from: trade.address,
            to: getTokenAddress(transfer.token, networkId),
            address: trade.address,
            toTransfer: transfer,
            ...(nodeExists ? undefined : { hyperNode: 'from' }),
          })
        )
      }
    })

  return {
    nodes: Object.values(nodes),
    edges,
  }
}

export function getTokenAddress(address: string, networkId: SupportedChainId): string {
  if (address.toLowerCase() === NATIVE_TOKEN_ADDRESS_LOWERCASE) {
    return WRAPPED_NATIVE_ADDRESS[networkId].toLowerCase()
  }
  return address.toLowerCase()
}

export const buildTokenViewNodes: BuildNodesFn = function getNodesAlternative(
  txSettlement: Settlement,
  networkId: Network,
  heightSize: number,
  layout: string
): ElementDefinition[] {
  const networkName = getChainInfo(networkId).label
  const networkNode = { alias: `${networkName} Liquidity` || '' }
  const builder = new ElementsBuilder(heightSize)

  builder.center({ type: TypeNodeOnTx.NetworkNode, entity: networkNode, id: networkNode.alias })

  const { trades, contractTrades, accounts, contracts, tokens } = txSettlement

  const contractsMap =
    contracts?.reduce((acc, contract) => {
      acc[contract.address] = contract.contract_name
      return acc
    }, {}) || {}

  const { nodes, edges } = getNotesAndEdges(trades, contractTrades || [], networkId)

  nodes.forEach((node) => {
    const entity = accounts?.[node.address] || {
      alias: abbreviateString(node.address, 6, 4),
      address: node.address,
      href: getBlockExplorerUrl(networkId, 'contract', node.address),
    }
    const type = node.isHyperNode ? TypeNodeOnTx.Hyper : TypeNodeOnTx.Token
    const tooltip = getNodeTooltip(node, edges, tokens)
    builder.node({ entity, id: node.address, type }, networkNode.alias, tooltip)
  })
  edges.forEach((edge) => {
    const source = {
      id: edge.from,
      type: edge.hyperNode === 'from' ? TypeNodeOnTx.Hyper : TypeNodeOnTx.Token,
    }
    const target = {
      id: edge.to,
      type: edge.hyperNode === 'to' ? TypeNodeOnTx.Hyper : TypeNodeOnTx.Token,
    }
    const label = getLabel(edge, contractsMap)
    const kind = edge.trade ? TypeEdgeOnTx.user : TypeEdgeOnTx.amm
    const tooltip = getTooltip(edge, tokens)
    builder.edge(source, target, label, kind, tooltip)
  })

  return builder.build(
    layout === 'grid'
      ? buildGridLayout(builder._countNodeTypes as Map<TypeNodeOnTx, number>, builder._center, builder._nodes)
      : undefined
  )
}

function getLabel(edge: TokenEdge, contractsMap: Record<string, string>): string {
  if (edge.trade) {
    return abbreviateString(edge.trade.orderUid, 6, 4)
  } else if (edge.hyperNode) {
    return ''
  } else if (edge.toTransfer && edge.fromTransfer) {
    return contractsMap[edge.address] || abbreviateString(edge.address, 6, 4)
  }
  return 'add transfer info'
}

function getTooltip(edge: TokenEdge, tokens: Record<string, SingleErc20State>): Record<string, string> {
  const tooltip = {}

  const fromToken = tokens[edge.from]
  const toToken = tokens[edge.to]

  if (edge.trade) {
    tooltip['order-id'] = edge.trade.orderUid
    tooltip['sold'] = getTokenTooltipAmount(fromToken, edge.trade.sellAmount)
    tooltip['bought'] = getTokenTooltipAmount(toToken, edge.trade.buyAmount)
  } else if (edge.hyperNode) {
    if (edge.fromTransfer) {
      tooltip['sold'] = getTokenTooltipAmount(fromToken, edge.fromTransfer?.value)
    }
    if (edge.toTransfer) {
      tooltip['bought'] = getTokenTooltipAmount(toToken, edge.toTransfer?.value)
    }
  } else {
    tooltip['sold'] = getTokenTooltipAmount(fromToken, edge.fromTransfer?.value)
    tooltip['bought'] = getTokenTooltipAmount(toToken, edge.toTransfer?.value)
  }

  return tooltip
}

function getNodeTooltip(
  node: TokenNode,
  edges: TokenEdge[],
  tokens: Record<string, SingleErc20State>
): Record<string, string> | undefined {
  if (node.isHyperNode) {
    return undefined
  }

  const tooltip = {}
  const address = node.address
  const token = tokens[address]

  let amount = BigInt(0)
  edges.forEach((edge) => {
    if (edge.from === address) {
      if (edge.fromTransfer) {
        amount += BigInt(edge.fromTransfer.value)
      } else if (edge.trade) {
        amount += BigInt(edge.trade.sellAmount)
      }
    }
    if (edge.to === address) {
      if (edge.toTransfer) {
        amount -= BigInt(edge.toTransfer.value)
      } else if (edge.trade) {
        amount -= BigInt(edge.trade.buyAmount)
      }
    }
  })

  tooltip['balance'] = getTokenTooltipAmount(token, amount.toString())

  return tooltip
}

function getTokenTooltipAmount(token: SingleErc20State, value: string | undefined): string {
  let amount, amount_atoms, amount_atoms_abs, sign
  if (token?.decimals && value) {
    amount_atoms = BigInt(value)
    sign = amount_atoms >= BigInt(0) ? BigInt(1) : BigInt(-1)
    amount_atoms_abs = sign * amount_atoms
    amount = formattingAmountPrecision(
      new BigNumber(amount_atoms_abs.toString()),
      token,
      FormatAmountPrecision.highPrecision
    )
  } else {
    amount = '-'
  }
  const tokenSymbol = token?.symbol || TOKEN_SYMBOL_UNKNOWN
  const sign_char = sign && sign > 0 ? '' : '-'

  return `${sign_char}${amount} ${tokenSymbol}`
}
