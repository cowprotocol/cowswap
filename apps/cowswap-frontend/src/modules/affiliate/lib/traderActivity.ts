import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'

import { decodeAppData } from 'modules/appData/utils/decodeAppData'

import { TraderActivityRow } from './affiliateProgramTypes'

const MIN_FEE_BPS = 1.9

type JsonRecord = Record<string, unknown>

interface BuildTraderActivityRowParams {
  order: unknown
  chainId: SupportedChainId
  referrerCode?: string
  boundReferrerCode?: string
  linkedSince?: string
  rewardsEnd?: string
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined

  const raw = value[key]

  return typeof raw === 'string' ? raw : undefined
}

function getApiAdditionalInfo(order: unknown): unknown {
  if (!isRecord(order)) return undefined

  return order.apiAdditionalInfo
}

function normalizeCode(code: string | undefined): string | undefined {
  if (!code) return undefined
  const trimmedCode = code.trim()

  return trimmedCode ? trimmedCode.toUpperCase() : undefined
}

function toTimestamp(dateValue: string | undefined): number | undefined {
  if (!dateValue) return undefined

  const timestamp = Date.parse(dateValue)
  return Number.isNaN(timestamp) ? undefined : timestamp
}

function toUtcDateKey(dateValue: string | undefined): string | undefined {
  const timestamp = toTimestamp(dateValue)
  if (timestamp === undefined) {
    return undefined
  }

  return new Date(timestamp).toISOString().slice(0, 10)
}

function getOrderDate(order: unknown): string {
  return readString(order, 'creationDate') || readString(order, 'creationTime') || ''
}

function getOrderTxHash(order: unknown): string | undefined {
  const additionalInfo = getApiAdditionalInfo(order)

  return (
    readString(order, 'fulfilledTransactionHash') ||
    readString(order, 'orderCreationHash') ||
    readString(additionalInfo, 'executedTransaction') ||
    readString(additionalInfo, 'executedTxHash') ||
    readString(additionalInfo, 'txHash')
  )
}

function getExecutedSellAmountBeforeFees(order: unknown): string | undefined {
  const additionalInfo = getApiAdditionalInfo(order)

  return (
    readString(additionalInfo, 'executedSellAmountBeforeFees') ||
    readString(order, 'executedSellAmountBeforeFees') ||
    readString(order, 'sellAmountBeforeFee')
  )
}

function getExecutedFeeAmount(order: unknown): string | undefined {
  const additionalInfo = getApiAdditionalInfo(order)

  return (
    readString(order, 'totalFee') ||
    readString(order, 'executedFee') ||
    readString(order, 'executedFeeAmount') ||
    readString(additionalInfo, 'totalFee') ||
    readString(additionalInfo, 'executedFee') ||
    readString(additionalInfo, 'executedFeeAmount')
  )
}

function getFeeInputs(order: unknown): {
  sellToken?: string
  feeToken?: string
  executedSellBeforeFees?: string
  executedFeeAmount?: string
} {
  const additionalInfo = getApiAdditionalInfo(order)

  return {
    sellToken: readString(order, 'sellToken')?.toLowerCase(),
    feeToken:
      readString(order, 'executedFeeToken')?.toLowerCase() ||
      readString(additionalInfo, 'executedFeeToken')?.toLowerCase() ||
      readString(order, 'feeToken')?.toLowerCase() ||
      readString(order, 'sellToken')?.toLowerCase(),
    executedSellBeforeFees: getExecutedSellAmountBeforeFees(order),
    executedFeeAmount: getExecutedFeeAmount(order),
  }
}

function getFeeBps(order: unknown): BigNumber | undefined {
  const { sellToken, feeToken, executedSellBeforeFees, executedFeeAmount } = getFeeInputs(order)

  if (!sellToken || !feeToken || sellToken !== feeToken || !executedSellBeforeFees || !executedFeeAmount) {
    return undefined
  }

  const sellBeforeFees = new BigNumber(executedSellBeforeFees)
  const fee = new BigNumber(executedFeeAmount)

  if (!sellBeforeFees.isFinite() || !fee.isFinite() || sellBeforeFees.lte(0) || fee.lt(0)) {
    return undefined
  }

  return fee.dividedBy(sellBeforeFees).multipliedBy(10_000)
}

function getReferrerMismatchReason(
  referrerCode: string | undefined,
  boundReferrerCode: string | undefined,
): string | undefined {
  const normalizedReferrerCode = normalizeCode(referrerCode)
  const normalizedBoundReferrerCode = normalizeCode(boundReferrerCode)

  if (
    !normalizedReferrerCode ||
    !normalizedBoundReferrerCode ||
    normalizedReferrerCode !== normalizedBoundReferrerCode
  ) {
    return 'Referrer code mismatch.'
  }

  return undefined
}

function getTimeWindowReason(orderDate: string, linkedSince?: string, rewardsEnd?: string): string | undefined {
  const orderTimestamp = toTimestamp(orderDate)
  if (orderTimestamp === undefined) {
    return 'Order timestamp unavailable.'
  }

  const orderDateKey = toUtcDateKey(orderDate)
  const linkedSinceDateKey = toUtcDateKey(linkedSince)

  if (orderDateKey && linkedSinceDateKey && orderDateKey < linkedSinceDateKey) {
    return 'Order predates rewards enrollment.'
  }

  const rewardsEndDateKey = toUtcDateKey(rewardsEnd)
  if (orderDateKey && rewardsEndDateKey && orderDateKey > rewardsEndDateKey) {
    return 'Order is after rewards period end.'
  }

  return undefined
}

function getFeeEligibilityReason(order: unknown): string | undefined {
  const feeBps = getFeeBps(order)
  if (!feeBps) {
    return 'Fee data unavailable for eligibility check.'
  }

  if (feeBps.lt(MIN_FEE_BPS)) {
    return `Fee below minimum threshold (${MIN_FEE_BPS} bps).`
  }

  return undefined
}

function getIneligibilityReason(
  order: unknown,
  referrerCode: string | undefined,
  boundReferrerCode: string | undefined,
  linkedSince?: string,
  rewardsEnd?: string,
): string | undefined {
  const referrerMismatchReason = getReferrerMismatchReason(referrerCode, boundReferrerCode)
  if (referrerMismatchReason) return referrerMismatchReason

  const orderDate = getOrderDate(order)
  const timeWindowReason = getTimeWindowReason(orderDate, linkedSince, rewardsEnd)
  if (timeWindowReason) return timeWindowReason

  return getFeeEligibilityReason(order)
}

function isOrderEligible(
  order: unknown,
  referrerCode: string | undefined,
  boundReferrerCode: string | undefined,
  linkedSince?: string,
  rewardsEnd?: string,
): boolean {
  return !getIneligibilityReason(order, referrerCode, boundReferrerCode, linkedSince, rewardsEnd)
}

export function getReferrerCodeFromAppData(fullAppData: string | undefined): string | undefined {
  if (!fullAppData) return undefined

  const decoded = decodeAppData(fullAppData)

  if (!decoded || !isRecord(decoded) || !isRecord(decoded.metadata) || !isRecord(decoded.metadata.referrer)) {
    return undefined
  }

  return normalizeCode(readString(decoded.metadata.referrer, 'code'))
}

export function getAppDataHash(order: unknown): string | undefined {
  const appData = readString(order, 'appData')

  if (!appData || appData.trim().startsWith('{')) {
    return undefined
  }

  return appData
}

export function extractFullAppDataFromResponse(response: unknown): string | undefined {
  if (!response) return undefined

  if (typeof response === 'string') {
    return response
  }

  if (!isRecord(response)) {
    return undefined
  }

  const fullAppData =
    readString(response, 'fullAppData') || readString(response, 'full_app_data') || readString(response, 'appData')

  if (fullAppData) {
    return fullAppData
  }

  const document = response.document
  if (isRecord(document)) {
    return JSON.stringify(document)
  }

  return undefined
}

export function getRowTimestamp(row: TraderActivityRow): number {
  const timestamp = toTimestamp(row.date)

  return timestamp ?? 0
}

export function isDateWithinRewardsWindow(date: string, linkedSince?: string, rewardsEnd?: string): boolean {
  const orderDateKey = toUtcDateKey(date)
  if (!orderDateKey) {
    return false
  }

  const linkedSinceDateKey = toUtcDateKey(linkedSince)
  if (linkedSinceDateKey && orderDateKey < linkedSinceDateKey) {
    return false
  }

  const rewardsEndDateKey = toUtcDateKey(rewardsEnd)
  if (rewardsEndDateKey && orderDateKey > rewardsEndDateKey) {
    return false
  }

  return true
}

function getOrderAmounts(order: unknown): { sellAmount: string; buyAmount: string } {
  const additionalInfo = getApiAdditionalInfo(order)
  const executedSellAmount = readString(additionalInfo, 'executedSellAmount') || readString(order, 'executedSellAmount')
  const executedBuyAmount = readString(additionalInfo, 'executedBuyAmount') || readString(order, 'executedBuyAmount')

  return {
    sellAmount: executedSellAmount || readString(order, 'sellAmount') || '',
    buyAmount: executedBuyAmount || readString(order, 'buyAmount') || '',
  }
}

function getOrderFee(order: unknown): { feeAmount?: string; feeToken?: string } {
  const additionalInfo = getApiAdditionalInfo(order)
  const feeAmount = getExecutedFeeAmount(order) || readString(order, 'feeAmount')
  const feeToken =
    readString(order, 'executedFeeToken') ||
    readString(additionalInfo, 'executedFeeToken') ||
    readString(order, 'feeToken') ||
    readString(order, 'sellToken')

  return {
    feeAmount: feeAmount || undefined,
    feeToken: feeToken || undefined,
  }
}

function getOrderIdentifiers(order: unknown): { orderUid: string; txHash?: string } {
  return {
    orderUid: readString(order, 'uid') || readString(order, 'id') || '',
    txHash: getOrderTxHash(order),
  }
}

export function buildTraderActivityRow({
  order,
  chainId,
  referrerCode,
  boundReferrerCode,
  linkedSince,
  rewardsEnd,
}: BuildTraderActivityRowParams): TraderActivityRow {
  const date = getOrderDate(order)
  const { orderUid, txHash } = getOrderIdentifiers(order)
  const { sellAmount, buyAmount } = getOrderAmounts(order)
  const { feeAmount, feeToken } = getOrderFee(order)
  const sellToken = readString(order, 'sellToken') || ''
  const buyToken = readString(order, 'buyToken') || ''
  const chainName = CHAIN_INFO[chainId].label
  const status = readString(order, 'status') || 'unknown'
  const isEligible = isOrderEligible(order, referrerCode, boundReferrerCode, linkedSince, rewardsEnd)
  const ineligibleReason = getIneligibilityReason(order, referrerCode, boundReferrerCode, linkedSince, rewardsEnd)

  return {
    date,
    chainId,
    chainName,
    orderUid,
    txHash,
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    feeAmount,
    feeToken,
    status,
    referrerCode: normalizeCode(referrerCode),
    isEligible,
    ineligibleReason,
  }
}
