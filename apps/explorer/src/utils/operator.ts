import { isSellOrder } from '@cowprotocol/common-utils'
import { FeePolicy, getAddressKey, Trade as TradeMetaData } from '@cowprotocol/cow-sdk'

import { calculatePrice, invertPrice, TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'const'
import { formatSmartMaxPrecision, formattingAmountPrecision } from 'utils'

import {
  Order,
  OrderStatus,
  ProtocolFee,
  ProtocolFeeOwner,
  ProtocolFeeType,
  RAW_ORDER_STATUS,
  RawOrder,
  RawTrade,
  Trade,
} from 'api/operator/types'

import { getOrderBridgeProviderId } from './getOrderBridgeProviderId'
import { PartnerFeePolicy } from './partnerFeePolicies'

import { PENDING_ORDERS_BUFFER } from '../explorer/const'

export type Surplus = {
  amount: BigNumber
  percentage: BigNumber
}

type PartialFillSurplusParams = {
  buyAmount: string | BigNumber
  sellAmount: string | BigNumber
  executedSellAmountBeforeFees: string
  executedBuyAmount: string
}

/**
 * Get order filled amount, both as raw amount (in atoms) and as percentage (from 0 to 1)
 *
 * @param order The order
 */
export function getOrderFilledAmount(order: RawOrder): { amount: BigNumber; percentage: BigNumber } {
  const { kind, executedBuyAmount, buyAmount, executedSellAmount, sellAmount, executedFeeAmount } = order
  let executedAmount, totalAmount

  if (isSellOrder(kind)) {
    executedAmount = new BigNumber(executedSellAmount).minus(executedFeeAmount)
    totalAmount = new BigNumber(sellAmount)
  } else {
    executedAmount = new BigNumber(executedBuyAmount)
    totalAmount = new BigNumber(buyAmount)
  }

  return { amount: executedAmount, percentage: executedAmount.div(totalAmount) }
}

export function getOrderStatus(order: RawOrder): OrderStatus {
  if (isOrderFilled(order)) {
    return OrderStatus.Filled
  } else if (isOrderCancelled(order)) {
    return OrderStatus.Cancelled
  } else if (isOrderExpired(order)) {
    return OrderStatus.Expired
  } else if (isOrderPresigning(order)) {
    return OrderStatus.Signing
  } else if (isOrderCancelling(order)) {
    return OrderStatus.Cancelling
  } else {
    return OrderStatus.Open
  }
}

/**
 * Calculates SELL surplus based on buy amounts
 *
 * @returns Sell surplus
 */
export function getSellSurplus(order: RawOrder): Surplus {
  const { partiallyFillable } = order

  const surplus = partiallyFillable ? _getPartialFillSellSurplus(order) : _getFillOrKillSellSurplus(order)

  return surplus || ZERO_SURPLUS
}

function _getFillOrKillSellSurplus(order: RawOrder): Surplus | null {
  const { buyAmount, executedBuyAmount } = order

  const buyAmountBigNumber = new BigNumber(buyAmount.toString())
  const executedBuyAmountBigNumber = new BigNumber(executedBuyAmount)

  // Difference between what you got minus what you wanted to get is the surplus
  const difference = executedBuyAmountBigNumber.minus(buyAmountBigNumber)

  const amount = difference.gt(ZERO_BIG_NUMBER) ? difference : ZERO_BIG_NUMBER

  const percentage = amount.dividedBy(executedBuyAmountBigNumber)

  return { amount, percentage }
}

/**
 * An order is considered cancelled if the `invalidated` flag is `true` and
 * it has been at least `PENDING_ORDERS_BUFFER` since it has been created.
 * The buffer is used to take into account race conditions where a solver might
 * execute a transaction after the backend changed the order status.
 *
 * We assume the order is not fulfilled.
 */
function isOrderCancelled(order: Pick<RawOrder, 'creationDate' | 'invalidated'>): boolean {
  const creationTime = new Date(order.creationDate).getTime()
  return order.invalidated && Date.now() - creationTime > PENDING_ORDERS_BUFFER
}

function isOrderCancelling(order: RawOrder): boolean {
  return order.status === RAW_ORDER_STATUS.CANCELLED && order.invalidated
}

function isOrderExpired(order: RawOrder): boolean {
  return Math.floor(Date.now() / 1000) > order.validTo
}

function isOrderFilled(order: RawOrder): boolean {
  const { kind, executedBuyAmount, sellAmount, executedSellAmount, buyAmount, executedFeeAmount } = order
  let amount, executedAmount

  if (isSellOrder(kind)) {
    amount = new BigNumber(sellAmount)
    executedAmount = new BigNumber(executedSellAmount).minus(executedFeeAmount)
  } else {
    amount = new BigNumber(buyAmount)
    executedAmount = new BigNumber(executedBuyAmount)
  }

  return executedAmount.gte(amount)
}

function isOrderPartiallyFilled(order: RawOrder): boolean {
  if (isOrderFilled(order)) {
    return false
  }
  if (isSellOrder(order.kind)) {
    return order.executedSellAmount !== '0'
  } else {
    return order.executedBuyAmount !== '0'
  }
}

function isOrderPresigning(order: RawOrder): boolean {
  return order.status === RAW_ORDER_STATUS.PRESIGNATURE_PENDING
}

// The surplus calculation can be called for huge and small values
// And default DECIMAL_PLACES=20 is not enough for it and can cause rounding problems
const BigNumberForSurplus = BigNumber.clone({ DECIMAL_PLACES: 32 })

/**
 * Calculates BUY surplus based on sell amounts
 *
 * @returns Buy surplus
 */
export function getBuySurplus(order: RawOrder): Surplus {
  const { partiallyFillable } = order

  const surplus = partiallyFillable ? _getPartialFillBuySurplus(order) : _getFillOrKillBuySurplus(order)

  return surplus || ZERO_SURPLUS
}

function _getFillOrKillBuySurplus(order: RawOrder): Surplus | null {
  const { sellAmount, executedSellAmountBeforeFees } = order

  const sellAmountBigNumber = new BigNumber(sellAmount)
  const executedSellAmountBigNumber = new BigNumber(executedSellAmountBeforeFees)

  // BUY order has the buy amount fixed, so it'll sell AT MOST `sellAmount`
  // Surplus will come in the form of a "discount", selling less than `sellAmount`
  // The difference between `sellAmount - executedSellAmount` is the surplus.
  const amount = sellAmountBigNumber.minus(executedSellAmountBigNumber)

  const percentage = amount.dividedBy(executedSellAmountBigNumber)

  return { amount, percentage }
}

function _getPartialFillBuySurplus(params: PartialFillSurplusParams): Surplus | null {
  const { buyAmount, sellAmount, executedSellAmountBeforeFees, executedBuyAmount } = params

  const sellAmountBigNumber = new BigNumberForSurplus(sellAmount)
  const executedSellAmountBigNumber = new BigNumberForSurplus(executedSellAmountBeforeFees)
  const buyAmountBigNumber = new BigNumberForSurplus(buyAmount)
  const executedBuyAmountBigNumber = new BigNumberForSurplus(executedBuyAmount)

  // SELL is QUOTE
  const price = sellAmountBigNumber.dividedBy(buyAmountBigNumber)

  const maximumSellAmount = executedBuyAmountBigNumber.multipliedBy(price)

  const amount = maximumSellAmount.minus(executedSellAmountBigNumber)

  const percentage = amount.dividedBy(executedSellAmountBigNumber)

  return { amount, percentage }
}

function _getPartialFillSellSurplus(params: PartialFillSurplusParams): Surplus | null {
  const { buyAmount, sellAmount, executedSellAmountBeforeFees, executedBuyAmount } = params

  const sellAmountBigNumber = new BigNumberForSurplus(sellAmount)
  const executedSellAmountBigNumber = new BigNumberForSurplus(executedSellAmountBeforeFees)
  const buyAmountBigNumber = new BigNumberForSurplus(buyAmount)
  const executedBuyAmountBigNumber = new BigNumberForSurplus(executedBuyAmount)

  // BUY is QUOTE
  const price = buyAmountBigNumber.dividedBy(sellAmountBigNumber)

  // What you would get at limit price, in buy token atoms
  const minimumBuyAmount = executedSellAmountBigNumber.multipliedBy(price)

  // Surplus is the difference between what you got minus what you would get if executed at limit price
  // Surplus amount, in buy token atoms
  const amount = executedBuyAmountBigNumber.minus(minimumBuyAmount)

  // The percentage is based on the amount you would receive, if executed at limit price
  const percentage = amount.dividedBy(executedBuyAmountBigNumber)

  return { amount, percentage }
}

export const ZERO_SURPLUS: Surplus = { amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER }

export type GetOrderLimitPriceParams = CommonPriceParams & {
  buyAmount: string | BigNumber
  sellAmount: string | BigNumber
}

export type GetRawOrderPriceParams = CommonPriceParams & {
  order: Pick<RawOrder, 'executedBuyAmount' | 'executedSellAmountBeforeFees'>
}

export enum FormatAmountPrecision {
  middlePrecision,
  highPrecision,
  maxPrecision,
}

interface CommonPriceParams {
  buyTokenDecimals: number
  sellTokenDecimals: number
  inverted?: boolean
}

export function formattedAmount(
  erc20: TokenErc20 | null | undefined,
  amount: BigNumber,
  typePrecision: FormatAmountPrecision = FormatAmountPrecision.maxPrecision,
): string {
  if (!isTokenErc20(erc20)) return '-'

  if (!erc20.decimals) return amount.toString(10)

  return typePrecision === FormatAmountPrecision.maxPrecision
    ? formatSmartMaxPrecision(amount, erc20)
    : formattingAmountPrecision(amount, erc20, typePrecision)
}

/**
 * Syntactic sugar to get the order's executed amounts as a BigNumber (in atoms)
 * Mostly because `executedSellAmount` (with fees deducted) is named `executedSellAmountBeforeFees`
 *
 * @param order The order
 */
export function getOrderExecutedAmounts(order: Pick<RawOrder, 'executedBuyAmount' | 'executedSellAmountBeforeFees'>): {
  executedBuyAmount: BigNumber
  executedSellAmount: BigNumber
} {
  const { executedBuyAmount, executedSellAmountBeforeFees } = order

  return {
    executedBuyAmount: new BigNumber(executedBuyAmount),
    executedSellAmount: new BigNumber(executedSellAmountBeforeFees),
  }
}

/**
 * Calculates order executed price base on order and buy/sell token decimals
 * Result is given in sell token units
 *
 * @param order The order
 * @param buyTokenDecimals The buy token decimals
 * @param sellTokenDecimals The sell token decimals
 * @param inverted Optional. Whether to invert the price (1/price).
 */
export function getOrderExecutedPrice({
  order,
  buyTokenDecimals,
  sellTokenDecimals,
  inverted,
}: GetRawOrderPriceParams): BigNumber {
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

  // Only calculate the price when both values are set
  // Having only one value > 0 is anyway an invalid state
  if (executedBuyAmount.isZero() || executedSellAmount.isZero()) {
    return ZERO_BIG_NUMBER
  }

  return getOrderLimitPrice({
    buyAmount: executedBuyAmount,
    sellAmount: executedSellAmount,
    buyTokenDecimals,
    sellTokenDecimals,
    inverted,
  })
}

/**
 * Calculates order limit price base on order and buy/sell token decimals
 * Result is given in sell token units
 *
 * @param buyAmount The order buyAmount
 * @param sellAmount The order sellAmount
 * @param buyTokenDecimals The buy token decimals
 * @param sellTokenDecimals The sell token decimals
 * @param inverted Optional. Whether to invert the price (1/price).
 */
export function getOrderLimitPrice({
  buyAmount,
  sellAmount,
  buyTokenDecimals,
  sellTokenDecimals,
  inverted,
}: GetOrderLimitPriceParams): BigNumber {
  const price = calculatePrice({
    numerator: { amount: sellAmount, decimals: sellTokenDecimals },
    denominator: { amount: buyAmount, decimals: buyTokenDecimals },
  })

  return inverted ? invertPrice(price) : price
}

export function getOrderSurplus(order: RawOrder): Surplus {
  const { kind } = order

  // `executedSellAmount` already has the fees discounted
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

  if (executedBuyAmount.isZero() || executedSellAmount.isZero()) {
    return ZERO_SURPLUS
  }

  if (isSellOrder(kind)) {
    return getSellSurplus(order)
  } else {
    return getBuySurplus(order)
  }
}

/**
 * Aggregates the fees charged across an order's fills into one total per (position, type, token).
 * Position alone is not a safe key: across fills it can carry a different token or policy, and
 * summing those would mix tokens.
 *
 * `partnerFeePolicies` comes from the order's app data (see {@link getPartnerFeePolicies}) and is
 * what each fee's owner is derived from.
 */
export function getProtocolFees(
  trades: Array<Pick<RawTrade, 'executedProtocolFees'>>,
  partnerFeePolicies?: PartnerFeePolicy[],
): ProtocolFee[] {
  const feesByPolicy = new Map<string, ProtocolFee>()

  for (const { executedProtocolFees } of trades) {
    if (!executedProtocolFees) continue

    executedProtocolFees.forEach(({ amount, token, policy }, position) => {
      if (!amount || !token) return

      const type = getProtocolFeeType(policy)
      const tokenAddress = getAddressKey(token)
      const key = `${position}-${type}-${tokenAddress}`

      const existing = feesByPolicy.get(key)
      if (existing) {
        existing.amount = existing.amount.plus(amount)
      } else {
        feesByPolicy.set(key, {
          amount: new BigNumber(amount),
          tokenAddress,
          type,
          factor: getProtocolFeeFactor(policy),
          position,
          owner: ProtocolFeeOwner.Protocol,
        })
      }
    })
  }

  const fees = Array.from(feesByPolicy.values()).sort((a, b) => a.position - b.position)

  // Before dropping the empty ones: a policy that charged nothing still occupies its place in its
  // type's run, so it has to be there for the partner boundary to line up.
  attributeFeeOwners(fees, partnerFeePolicies)

  const charged = fees.filter((fee) => fee.amount.isGreaterThan(0))

  // After dropping them, so the numbers the user sees start at 1 and have no gaps.
  numberPartners(charged)

  return charged
}

export function getTradeSurplus(rawTrade: TradeMetaData, order: Order): Surplus {
  const params: PartialFillSurplusParams = {
    sellAmount: order.sellAmount,
    buyAmount: order.buyAmount,
    executedSellAmountBeforeFees: rawTrade.sellAmountBeforeFees,
    executedBuyAmount: rawTrade.buyAmount,
  }

  const surplus = isSellOrder(order.kind) ? _getPartialFillSellSurplus(params) : _getPartialFillBuySurplus(params)

  return surplus || ZERO_SURPLUS
}

export function isTokenErc20(token: TokenErc20 | null | undefined): token is TokenErc20 {
  return (token as TokenErc20)?.address !== undefined
}

/**
 * Transforms a RawOrder into an Order object
 *
 * @param rawOrder RawOrder object
 */
export function transformOrder(rawOrder: RawOrder): Order {
  const {
    creationDate,
    validTo,
    buyToken,
    sellToken,
    buyAmount,
    sellAmount,
    feeAmount,
    executedFeeAmount,
    executedFee,
    totalFee,
    gasCost,
    invalidated,
    ...rest
  } = rawOrder
  const receiver = getReceiverAddress(rawOrder)
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(rawOrder)
  const status = getOrderStatus(rawOrder)
  const partiallyFilled = isOrderPartiallyFilled(rawOrder)
  const fullyFilled = isOrderFilled(rawOrder)
  const { amount: filledAmount, percentage: filledPercentage } = getOrderFilledAmount(rawOrder)
  const { amount: surplusAmount, percentage: surplusPercentage } = getOrderSurplus(rawOrder)
  const bridgeProviderId = getOrderBridgeProviderId(rawOrder)

  return {
    ...rest,
    receiver,
    creationDate: new Date(creationDate),
    expirationDate: new Date(validTo * 1000),
    buyTokenAddress: buyToken,
    sellTokenAddress: sellToken,
    buyAmount: new BigNumber(buyAmount),
    sellAmount: new BigNumber(sellAmount),
    executedBuyAmount,
    executedSellAmount,
    feeAmount: new BigNumber(feeAmount),
    executedFeeAmount: new BigNumber(executedFeeAmount),
    executedFee: executedFee ? new BigNumber(executedFee) : null,
    totalFee: new BigNumber(totalFee),
    gasCost: gasCost ? new BigNumber(gasCost) : undefined,
    cancelled: invalidated,
    status,
    partiallyFilled,
    fullyFilled,
    filledAmount,
    filledPercentage,
    surplusAmount,
    surplusPercentage,
    bridgeProviderId,
  } as Order
}

/**
 * Transforms a RawTrade into a Trade object
 */
export function transformTrade(rawTrade: TradeMetaData, order: Order, executionTimestamp?: number): Trade {
  const { orderUid, buyAmount, sellAmount, sellAmountBeforeFees, buyToken, sellToken, ...rest } = rawTrade
  const { amount, percentage } = getTradeSurplus(rawTrade, order)

  return {
    ...rest,
    orderId: orderUid,
    kind: order.kind,
    buyAmount: new BigNumber(buyAmount),
    sellAmount: new BigNumber(sellAmount),
    sellAmountBeforeFees: new BigNumber(sellAmountBeforeFees),
    buyTokenAddress: buyToken,
    sellTokenAddress: sellToken,
    surplusAmount: amount,
    surplusPercentage: percentage,
    executionTime: executionTimestamp ? new Date(executionTimestamp * 1000) : null,
  }
}

/**
 * Marks each applied fee policy as the protocol's or a partner's, in place.
 *
 * The API doesn't record who a fee belongs to, so it is derived per fee type. Within one type the
 * protocol's own policy is applied before any partner's, and the partner policies keep the order
 * the app data declared them in. Matching per type rather than over one trailing run keeps this
 * correct both for today's ordering (the protocol's policies, then the app data's) and for the
 * planned grouped ordering, where the partner fees are no longer a single run at the end.
 *
 * Each type's declarations are checked against the end of that type's run. If they don't line up,
 * or there is no app data to check against, that type falls back to the positional rule alone: the
 * first fee of a type is the protocol's, the rest are partners'.
 */
function attributeFeeOwners(fees: ProtocolFee[], partnerFeePolicies: PartnerFeePolicy[] | undefined): void {
  const declaredByType = new Map<ProtocolFeeType, PartnerFeePolicy[]>()

  for (const declared of partnerFeePolicies ?? []) {
    const forType = declaredByType.get(declared.type)
    if (forType) forType.push(declared)
    else declaredByType.set(declared.type, [declared])
  }

  const feesByType = new Map<ProtocolFeeType, ProtocolFee[]>()

  for (const fee of fees) {
    const forType = feesByType.get(fee.type)
    if (forType) forType.push(fee)
    else feesByType.set(fee.type, [fee])
  }

  for (const typeFees of feesByType.values()) {
    // `undefined` means there is nothing to check against, as opposed to `[]` for app data that
    // declares no partner fee of this type — then every fee of the type is the protocol's.
    const declared = partnerFeePolicies && (declaredByType.get(typeFees[0].type) ?? [])

    attributeTypeOwners(typeFees, declared)
  }
}

/** Attributes one fee type's policies, in the order they were applied. */
function attributeTypeOwners(typeFees: ProtocolFee[], declared: PartnerFeePolicy[] | undefined): void {
  const matched = declared && matchDeclaredPolicies(typeFees, declared)
  // Without a match to go by, everything past the protocol's own policy is a partner's.
  const partnerCount = matched ? matched.length : Math.max(0, typeFees.length - 1)
  const partnerStart = typeFees.length - partnerCount

  typeFees.forEach((fee, index) => {
    if (index < partnerStart) {
      fee.owner = ProtocolFeeOwner.Protocol
      return
    }

    fee.owner = ProtocolFeeOwner.Partner
    fee.recipient = matched?.[index - partnerStart].recipient
  })
}

/**
 * Returns the fee policy's `factor`, when present (meaning is policy-specific; see
 * {@link ProtocolFee.factor}).
 */
function getProtocolFeeFactor(policy: FeePolicy | undefined): number | undefined {
  if (policy) {
    if ('surplus' in policy) return policy.surplus.factor
    if ('volume' in policy) return policy.volume.factor
    if ('priceImprovement' in policy) return policy.priceImprovement.factor
  }
  return undefined
}

function getProtocolFeeType(policy: FeePolicy | undefined): ProtocolFeeType {
  if (policy) {
    if ('surplus' in policy) return ProtocolFeeType.Surplus
    if ('volume' in policy) return ProtocolFeeType.Volume
    if ('priceImprovement' in policy) return ProtocolFeeType.PriceImprovement
  }
  return ProtocolFeeType.Unknown
}

function getReceiverAddress({ owner, receiver }: RawOrder): string {
  return !receiver || isZeroAddress(receiver) ? owner : receiver
}

function isZeroAddress(address: string): boolean {
  return /^0x0{40}$/.test(address)
}

/**
 * The declared policies matched onto the end of a fee type's run, from the bottom up, or
 * `undefined` when they don't line up with what was applied.
 */
function matchDeclaredPolicies(typeFees: ProtocolFee[], declared: PartnerFeePolicy[]): PartnerFeePolicy[] | undefined {
  // A partner can declare a policy the order never applied, so match only as far as both go.
  const matched = declared.slice(Math.max(0, declared.length - typeFees.length))
  const partnerStart = typeFees.length - matched.length

  const linesUp = matched.every((policy, index) => matchesDeclaredRate(typeFees[partnerStart + index], policy))

  return linesUp ? matched : undefined
}

function matchesDeclaredRate(fee: ProtocolFee, declared: PartnerFeePolicy): boolean {
  // The protocol caps partner fees, so the executed rate can be below the declared one, never above.
  // The epsilon absorbs the rounding of bps to a fraction.
  return fee.factor === undefined || fee.factor <= declared.factor + 1e-9
}

/**
 * Numbers the partners from 1, in the order their fees appear.
 *
 * Partners are never named, so the number is what tells them apart: fees sharing a recipient share
 * a number, which distinguishes one partner charging two fees from two partners charging one each
 * (the Kerberus case). A partner fee with no known recipient counts as its own partner.
 *
 * Known limitation: the recipient is all the app data gives us, and an order may name a different
 * recipient per fee kind — the volume fee paid to one address, the price improvement fee to
 * another. One integrator splitting its fees over two addresses therefore counts as two partners.
 * That is the accepted trade-off: nothing in the app data says which addresses belong together, and
 * sharing a number between two addresses would misreport the more common case of two genuinely
 * distinct partners.
 */
function numberPartners(fees: ProtocolFee[]): void {
  const numberByPartner = new Map<string, number>()

  for (const fee of fees) {
    if (fee.owner !== ProtocolFeeOwner.Partner) continue

    const key = fee.recipient ? getAddressKey(fee.recipient) : `position-${fee.position}`
    let number = numberByPartner.get(key)

    if (number === undefined) {
      number = numberByPartner.size + 1
      numberByPartner.set(key, number)
    }

    fee.partnerNumber = number
  }
}
