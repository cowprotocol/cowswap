import { isSellOrder } from '@cowprotocol/common-utils'

import BigNumber from 'bignumber.js'

import { getContractTrades, getTokenAddress } from './nodesBuilder'
import { BatchInsights, CompactRoute, CompactTokenInfo, CowFlowAllocation, CowFlowSummary } from './types'

import { Order } from '../../../api/operator'
import { Contract, Trade, Transfer } from '../../../api/tenderly'
import { APP_NAME } from '../../../const'
import { SingleErc20State } from '../../../state/erc20'
import { Network } from '../../../types'
import { FormatAmountPrecision, abbreviateString, formatPercentage, formattedAmount } from '../../../utils'
import { TOKEN_SYMBOL_UNKNOWN } from '../../const'

const SETTLEMENT_CONTRACT_ADDRESSES = new Set(['0x9008d19f58aabd9ed0d60971565aa8510560ab41'])
const SPECIAL_FLOW_CONTRACT_ADDRESSES = new Set(['0x40a50cf069e992aa4536211b23f286ef88752187'])

type BuildBatchInsightsParams = {
  networkId: Network | undefined
  orders: Order[] | undefined
  trades: Trade[]
  transfers: Transfer[]
  contracts: Contract[]
  tokens: Record<string, SingleErc20State>
  txSender?: string
}

export function buildBatchInsights(params: BuildBatchInsightsParams): BatchInsights {
  const { networkId, orders, trades, transfers, contracts, tokens, txSender } = params
  const orderCount = orders?.length || trades.length
  const safeOrders = orders ?? []
  const contractTrades = getContractTrades(trades, transfers, orders)
  const interactionAddresses = contractTrades.map((trade) => trade.address.toLowerCase())
  const interactionCount = contractTrades.length
  const dexContract = getPrimaryDexContract(contracts, orders, trades, interactionAddresses)
  const dexAddress = dexContract?.address || interactionAddresses[0]
  const cowSignal = detectPossibleCowSignal(trades, tokens, networkId)
  const compactRoutes = annotateRoutesWithUsdEstimates(buildCompactRoutes({ networkId, orders, trades, tokens }))
  const cowFlow = buildCowFlow(compactRoutes, cowSignal.possibleCowTokenLabels)
  const hasUsdEstimates = compactRoutes.some((route) => route.sellAmountUsdValue || route.buyAmountUsdValue)
  const bridgeOrdersCount = safeOrders.filter((order) => !!order.bridgeProviderId).length

  return {
    orderCount,
    tradeCount: trades.length,
    transferCount: transfers.length,
    interactionCount,
    dexLabel: getDexLabel(dexContract),
    dexAddress,
    hasPossibleCow: cowSignal.hasPossibleCow,
    possibleCowTokenLabels: cowSignal.possibleCowTokenLabels,
    useCompactByDefault: true,
    compactRoutes,
    cowFlow,
    hasUsdEstimates,
    solverAddress: txSender?.toLowerCase(),
    bridgeOrdersCount,
    surplusOrdersCount: safeOrders.filter((order) => order.surplusPercentage.gt(0)).length,
  }
}

type BuildCompactRoutesParams = {
  networkId: Network | undefined
  orders: Order[] | undefined
  trades: Trade[]
  tokens: Record<string, SingleErc20State>
}

function buildCompactRoutes(params: BuildCompactRoutesParams): CompactRoute[] {
  const { networkId, orders, trades, tokens } = params
  if (orders?.length) {
    return orders.map((order) => {
      const sellToken = getRouteToken(networkId, tokens, order.sellTokenAddress, order.sellToken)
      const buyToken = getRouteToken(networkId, tokens, order.buyTokenAddress, order.buyToken)
      const owner = order.owner
      const receiver = order.receiver || owner
      return {
        id: order.uid,
        traderAddress: owner,
        traderLabel: abbreviateString(owner, 6, 4),
        receiverAddress: receiver,
        receiverLabel: abbreviateString(receiver, 6, 4),
        sellAmountLabel: formatTokenAmountLabel(order.executedSellAmount, sellToken),
        buyAmountLabel: formatTokenAmountLabel(order.executedBuyAmount, buyToken),
        sellAmountValue: tokenAmountToNumber(order.executedSellAmount, sellToken),
        buyAmountValue: tokenAmountToNumber(order.executedBuyAmount, buyToken),
        sellToken: toCompactTokenInfo(sellToken, order.sellTokenAddress),
        buyToken: toCompactTokenInfo(buyToken, order.buyTokenAddress),
        surplusLabel: order.surplusPercentage.gt(0) ? `+${formatPercentage(order.surplusPercentage)}` : undefined,
        surplusSide: isSellOrder(order.kind) ? 'receive' : 'sell',
      }
    })
  }

  return trades.map((trade, index) => {
    const sellTokenAddress = normalizeTokenAddress(networkId, trade.sellToken)
    const buyTokenAddress = normalizeTokenAddress(networkId, trade.buyToken)
    const sellToken = tokens[sellTokenAddress]
    const buyToken = tokens[buyTokenAddress]

    return {
      id: `${trade.orderUid}-${index}`,
      traderAddress: trade.owner,
      traderLabel: abbreviateString(trade.owner, 6, 4),
      receiverAddress: trade.owner,
      receiverLabel: abbreviateString(trade.owner, 6, 4),
      sellAmountLabel: formatTokenAmountLabel(new BigNumber(trade.sellAmount), sellToken),
      buyAmountLabel: formatTokenAmountLabel(new BigNumber(trade.buyAmount), buyToken),
      sellAmountValue: tokenAmountToNumber(new BigNumber(trade.sellAmount), sellToken),
      buyAmountValue: tokenAmountToNumber(new BigNumber(trade.buyAmount), buyToken),
      sellToken: toCompactTokenInfo(sellToken, sellTokenAddress),
      buyToken: toCompactTokenInfo(buyToken, buyTokenAddress),
    }
  })
}

function getRouteToken(
  networkId: Network | undefined,
  tokens: Record<string, SingleErc20State>,
  address: string,
  tokenFromOrder: SingleErc20State | undefined,
): SingleErc20State | undefined {
  if (tokenFromOrder) {
    return tokenFromOrder
  }
  const tokenAddress = normalizeTokenAddress(networkId, address)
  return tokens[tokenAddress]
}

function toCompactTokenInfo(
  token: SingleErc20State | undefined,
  fallbackAddress: string,
): CompactTokenInfo | undefined {
  const symbol = token?.symbol || TOKEN_SYMBOL_UNKNOWN
  const address = token?.address || fallbackAddress

  if (!address) {
    return undefined
  }
  return {
    address,
    symbol,
    name: token?.name || undefined,
  }
}

function formatTokenAmountLabel(amount: BigNumber, token: SingleErc20State | undefined): string {
  const symbol = token?.symbol || TOKEN_SYMBOL_UNKNOWN
  const formatted = formattedAmount(token, amount, FormatAmountPrecision.highPrecision)
  const amountLabel = formatted === '-' ? amount.toFormat(0) : formatted
  return `${amountLabel} ${symbol}`
}

function buildCowFlow(routes: CompactRoute[], possibleCowTokenLabels: string[]): CowFlowSummary | undefined {
  if (!routes.length || !possibleCowTokenLabels.length) {
    return undefined
  }

  const bestToken = getBestCowToken(routes, possibleCowTokenLabels)
  if (!bestToken) {
    return undefined
  }

  const providers = routes.filter((route) => route.sellToken?.symbol === bestToken.symbol)
  const receivers = routes.filter((route) => route.buyToken?.symbol === bestToken.symbol)
  return buildCowFlowSummary(bestToken, providers, receivers, routes)
}

type BestCowToken = { symbol: string; matchedValue: number }

function getBestCowToken(routes: CompactRoute[], possibleCowTokenLabels: string[]): BestCowToken | undefined {
  let bestToken: BestCowToken | undefined

  possibleCowTokenLabels.forEach((symbol) => {
    const matchedValue = getTokenMatchedValue(routes, symbol)
    if (matchedValue <= 0) {
      return
    }

    if (!bestToken || matchedValue > bestToken.matchedValue) {
      bestToken = { symbol, matchedValue }
    }
  })

  return bestToken
}

function getTokenMatchedValue(routes: CompactRoute[], symbol: string): number {
  const sellValue = routes.reduce(
    (sum, route) => (route.sellToken?.symbol === symbol ? sum + route.sellAmountValue : sum),
    0,
  )
  const buyValue = routes.reduce(
    (sum, route) => (route.buyToken?.symbol === symbol ? sum + route.buyAmountValue : sum),
    0,
  )

  return Math.min(sellValue, buyValue)
}

function buildCowFlowSummary(
  bestToken: BestCowToken,
  providers: CompactRoute[],
  receivers: CompactRoute[],
  routes: CompactRoute[],
): CowFlowSummary | undefined {
  const providerTotal = providers.reduce((sum, route) => sum + route.sellAmountValue, 0)
  const receiverTotal = receivers.reduce((sum, route) => sum + route.buyAmountValue, 0)

  if (!providerTotal || !receiverTotal) {
    return undefined
  }

  const tokenAddress = providers[0]?.sellToken?.address || receivers[0]?.buyToken?.address
  const tokenUsdPrice = getTokenUsdPrice(routes, bestToken.symbol)
  const providerAllocations = splitCowAllocation({
    matchedValue: bestToken.matchedValue,
    routes: providers,
    selector: (route) => route.sellAmountValue,
    symbol: bestToken.symbol,
    tokenUsdPrice,
  })
  const receiverAllocations = splitCowAllocation({
    matchedValue: bestToken.matchedValue,
    routes: receivers,
    selector: (route) => route.buyAmountValue,
    symbol: bestToken.symbol,
    tokenUsdPrice,
  })
  const matchedAmountUsdValue = tokenUsdPrice ? bestToken.matchedValue * tokenUsdPrice : undefined
  const estimatedLpFeeSavingsUsd = matchedAmountUsdValue ? matchedAmountUsdValue * 0.003 : 0

  return {
    tokenSymbol: bestToken.symbol,
    tokenAddress,
    matchedAmountValue: bestToken.matchedValue,
    matchedAmountLabel: `${formatTokenValue(bestToken.matchedValue)} ${bestToken.symbol}`,
    matchedAmountUsdValue,
    estimatedLpFeeSavingsUsd,
    confidence: 'heuristic',
    providerAllocations,
    receiverAllocations,
  }
}

type SplitCowAllocationParams = {
  matchedValue: number
  routes: CompactRoute[]
  selector: (route: CompactRoute) => number
  symbol: string
  tokenUsdPrice?: number
}

function splitCowAllocation(params: SplitCowAllocationParams): CowFlowAllocation[] {
  const { matchedValue, routes, selector, symbol, tokenUsdPrice } = params
  const total = routes.reduce((sum, route) => sum + selector(route), 0)

  if (!total) {
    return []
  }

  return routes
    .map((route) => {
      const amountValue = (matchedValue * selector(route)) / total

      return {
        routeId: route.id,
        amountValue,
        amountLabel: `${formatTokenValue(amountValue)} ${symbol}`,
        amountUsdValue: tokenUsdPrice ? amountValue * tokenUsdPrice : undefined,
      }
    })
    .filter((allocation) => allocation.amountValue > 0)
}

function getTokenUsdPrice(routes: CompactRoute[], symbol: string): number | undefined {
  const routesWithUsd = routes.filter(
    (route) =>
      route.sellToken?.symbol === symbol &&
      route.sellAmountValue > 0 &&
      route.sellAmountUsdValue !== undefined &&
      route.sellAmountUsdValue > 0,
  )

  if (routesWithUsd.length) {
    const totalUsd = routesWithUsd.reduce((sum, route) => sum + (route.sellAmountUsdValue || 0), 0)
    const totalAmount = routesWithUsd.reduce((sum, route) => sum + route.sellAmountValue, 0)

    if (totalAmount > 0 && totalUsd > 0) {
      return totalUsd / totalAmount
    }
  }

  const routesWithBuyUsd = routes.filter(
    (route) =>
      route.buyToken?.symbol === symbol &&
      route.buyAmountValue > 0 &&
      route.buyAmountUsdValue !== undefined &&
      route.buyAmountUsdValue > 0,
  )

  if (!routesWithBuyUsd.length) {
    return undefined
  }

  const totalUsd = routesWithBuyUsd.reduce((sum, route) => sum + (route.buyAmountUsdValue || 0), 0)
  const totalAmount = routesWithBuyUsd.reduce((sum, route) => sum + route.buyAmountValue, 0)

  if (totalAmount <= 0 || totalUsd <= 0) {
    return undefined
  }

  return totalUsd / totalAmount
}

function formatTokenValue(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

function tokenAmountToNumber(amount: BigNumber, token: SingleErc20State | undefined): number {
  if (!token?.decimals) {
    const directValue = amount.toNumber()
    return Number.isFinite(directValue) ? Math.max(directValue, 0) : 0
  }

  const normalizedValue = amount.shiftedBy(-token.decimals).toNumber()

  return Number.isFinite(normalizedValue) ? Math.max(normalizedValue, 0) : 0
}

const USD_PEGGED_SYMBOLS = new Set(
  [
    'USDC',
    'USDT',
    'DAI',
    'USDE',
    'USDS',
    'USDP',
    'TUSD',
    'LUSD',
    'FDUSD',
    'PYUSD',
    'GUSD',
    'SUSDE',
    'FRAX',
    'USDBC',
    'USDD',
    'USDC.E',
    'USDT.E',
  ].map(normalizeSymbol),
)

function annotateRoutesWithUsdEstimates(routes: CompactRoute[]): CompactRoute[] {
  if (!routes.length) {
    return routes
  }

  const tokenUsdPrices = inferTokenUsdPrices(routes)

  return routes.map((route) => annotateRouteWithUsdEstimate(route, tokenUsdPrices))
}

function inferTokenUsdPrices(routes: CompactRoute[]): Map<string, number> {
  const tokenUsdPrices = new Map<string, number>()

  routes.forEach((route) => seedUsdPriceFromRoute(route, tokenUsdPrices))

  for (let i = 0; i < routes.length * 3; i++) {
    let updated = false

    routes.forEach((route) => {
      if (inferUsdPriceFromRoute(route, tokenUsdPrices)) {
        updated = true
      }
    })

    if (!updated) {
      break
    }
  }

  return tokenUsdPrices
}

function annotateRouteWithUsdEstimate(route: CompactRoute, tokenUsdPrices: Map<string, number>): CompactRoute {
  const sellTokenAddress = route.sellToken?.address?.toLowerCase()
  const buyTokenAddress = route.buyToken?.address?.toLowerCase()
  const sellAmountUsdValue = sellTokenAddress
    ? getAmountUsdValue(route.sellAmountValue, tokenUsdPrices.get(sellTokenAddress))
    : undefined
  const buyAmountUsdValue = buyTokenAddress
    ? getAmountUsdValue(route.buyAmountValue, tokenUsdPrices.get(buyTokenAddress))
    : undefined

  return {
    ...route,
    sellAmountUsdValue: sellAmountUsdValue ?? buyAmountUsdValue,
    buyAmountUsdValue: buyAmountUsdValue ?? sellAmountUsdValue,
  }
}

function seedUsdPriceFromRoute(route: CompactRoute, tokenUsdPrices: Map<string, number>): void {
  seedStableTokenPrice(route.sellToken?.address, route.sellToken?.symbol, tokenUsdPrices)
  seedStableTokenPrice(route.buyToken?.address, route.buyToken?.symbol, tokenUsdPrices)
}

function inferUsdPriceFromRoute(route: CompactRoute, tokenUsdPrices: Map<string, number>): boolean {
  const addresses = getRouteAddressesForInference(route)
  if (!addresses) {
    return false
  }
  const { sellAddress, buyAddress } = addresses

  const sellPrice = tokenUsdPrices.get(sellAddress)
  const buyPrice = tokenUsdPrices.get(buyAddress)

  if (sellPrice !== undefined) {
    return inferAndStoreUsdPrice({
      sourcePrice: sellPrice,
      sourceAmount: route.sellAmountValue,
      targetAmount: route.buyAmountValue,
      targetAddress: buyAddress,
      targetPrice: buyPrice,
      tokenUsdPrices,
    })
  }

  if (buyPrice !== undefined) {
    return inferAndStoreUsdPrice({
      sourcePrice: buyPrice,
      sourceAmount: route.buyAmountValue,
      targetAmount: route.sellAmountValue,
      targetAddress: sellAddress,
      targetPrice: sellPrice,
      tokenUsdPrices,
    })
  }

  return false
}

function getRouteAddressesForInference(route: CompactRoute): { sellAddress: string; buyAddress: string } | undefined {
  const sellAddress = route.sellToken?.address?.toLowerCase()
  const buyAddress = route.buyToken?.address?.toLowerCase()

  if (!sellAddress || !buyAddress || route.sellAmountValue <= 0 || route.buyAmountValue <= 0) {
    return undefined
  }

  return { sellAddress, buyAddress }
}

type InferAndStoreUsdPriceParams = {
  sourcePrice: number
  sourceAmount: number
  targetAmount: number
  targetAddress: string
  targetPrice: number | undefined
  tokenUsdPrices: Map<string, number>
}

function inferAndStoreUsdPrice(params: InferAndStoreUsdPriceParams): boolean {
  const { sourcePrice, sourceAmount, targetAmount, targetAddress, targetPrice, tokenUsdPrices } = params

  if (targetPrice !== undefined) {
    return false
  }

  const inferredPrice = (sourcePrice * sourceAmount) / targetAmount
  if (!isValidUsdPrice(inferredPrice)) {
    return false
  }

  tokenUsdPrices.set(targetAddress, inferredPrice)
  return true
}

function seedStableTokenPrice(
  address: string | undefined,
  symbol: string | undefined,
  tokenUsdPrices: Map<string, number>,
): void {
  if (!address || !symbol || !isUsdPeggedToken(symbol)) {
    return
  }

  tokenUsdPrices.set(address.toLowerCase(), 1)
}

function isValidUsdPrice(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function getAmountUsdValue(amountValue: number, usdPrice: number | undefined): number | undefined {
  if (!usdPrice || amountValue <= 0) {
    return undefined
  }

  const usdValue = amountValue * usdPrice
  if (!Number.isFinite(usdValue) || usdValue <= 0) {
    return undefined
  }

  return usdValue
}

function isUsdPeggedToken(symbol: string): boolean {
  return USD_PEGGED_SYMBOLS.has(normalizeSymbol(symbol))
}

function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function normalizeTokenAddress(networkId: Network | undefined, tokenAddress: string): string {
  return getTokenAddress(tokenAddress, networkId || 1)
}

type PossibleCowSignal = {
  hasPossibleCow: boolean
  possibleCowTokenLabels: string[]
}

function detectPossibleCowSignal(
  trades: Trade[],
  tokens: Record<string, SingleErc20State>,
  networkId: Network | undefined,
): PossibleCowSignal {
  if (trades.length < 2) {
    return { hasPossibleCow: false, possibleCowTokenLabels: [] }
  }

  const tokenFlows = new Map<
    string,
    {
      sellers: Set<string>
      buyers: Set<string>
      sellVolume: bigint
      buyVolume: bigint
    }
  >()

  trades.forEach((trade) => {
    const sellToken = normalizeTokenAddress(networkId, trade.sellToken)
    const buyToken = normalizeTokenAddress(networkId, trade.buyToken)
    const sellData = tokenFlows.get(sellToken) || {
      sellers: new Set<string>(),
      buyers: new Set<string>(),
      sellVolume: BigInt(0),
      buyVolume: BigInt(0),
    }
    sellData.sellers.add(trade.owner.toLowerCase())
    sellData.sellVolume += BigInt(trade.sellAmount)
    tokenFlows.set(sellToken, sellData)

    const buyData = tokenFlows.get(buyToken) || {
      sellers: new Set<string>(),
      buyers: new Set<string>(),
      sellVolume: BigInt(0),
      buyVolume: BigInt(0),
    }
    buyData.buyers.add(trade.owner.toLowerCase())
    buyData.buyVolume += BigInt(trade.buyAmount)
    tokenFlows.set(buyToken, buyData)
  })

  const possibleCowTokenLabels = Array.from(tokenFlows.entries()).reduce<string[]>((acc, [tokenAddress, flow]) => {
    const uniqueParticipants = new Set([...flow.sellers, ...flow.buyers]).size
    const matchedVolume = flow.sellVolume < flow.buyVolume ? flow.sellVolume : flow.buyVolume

    if (flow.sellers.size && flow.buyers.size && uniqueParticipants > 1 && matchedVolume > 0) {
      const symbol = tokens[tokenAddress]?.symbol || abbreviateString(tokenAddress, 6, 4)
      acc.push(symbol)
    }

    return acc
  }, [])

  return {
    hasPossibleCow: possibleCowTokenLabels.length > 0,
    possibleCowTokenLabels,
  }
}

function getPrimaryDexContract(
  contracts: Contract[],
  orders: Order[] | undefined,
  trades: Trade[],
  interactionAddresses: string[],
): Contract | undefined {
  if (!interactionAddresses.length) {
    return undefined
  }

  const interactionAddressSet = new Set(interactionAddresses)
  const traderAddresses = new Set<string>()
  orders?.forEach((order) => {
    traderAddresses.add(order.owner.toLowerCase())
    traderAddresses.add(order.receiver.toLowerCase())
  })

  trades.forEach((trade) => traderAddresses.add(trade.owner.toLowerCase()))

  return contracts.find((contract) => {
    const address = contract.address.toLowerCase()
    const contractName = contract.contract_name.toLowerCase()

    return (
      interactionAddressSet.has(address) &&
      !traderAddresses.has(address) &&
      !SETTLEMENT_CONTRACT_ADDRESSES.has(address) &&
      !SPECIAL_FLOW_CONTRACT_ADDRESSES.has(address) &&
      contractName !== 'gpv2settlement' &&
      contractName !== APP_NAME.toLowerCase()
    )
  })
}

const KNOWN_DEX_LABELS: Array<{ terms: string[]; label: string }> = [
  { terms: ['uniswap', 'v3'], label: 'Uniswap V3' },
  { terms: ['uniswap', 'v2'], label: 'Uniswap V2' },
  { terms: ['sushi'], label: 'SushiSwap' },
  { terms: ['curve'], label: 'Curve' },
  { terms: ['balancer'], label: 'Balancer' },
  { terms: ['cow amm'], label: 'CoW AMM' },
]

function getDexLabel(contract: Contract | undefined): string {
  if (!contract) {
    return 'AMM / DEX'
  }

  const name = contract.contract_name
  const lowerName = name.toLowerCase()

  if (lowerName.includes('erc20token')) return 'AMM / DEX'

  const knownLabel = KNOWN_DEX_LABELS.find(({ terms }) => terms.every((term) => lowerName.includes(term)))?.label
  if (knownLabel) return knownLabel

  return name.replace(/([a-z])([A-Z])/g, '$1 $2')
}
