import { useMemo } from 'react'

import { USDC } from '@cowprotocol/common-const'
import { SupportedChainId, getTokenId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { BigNumber } from '@ethersproject/bignumber'

import { PrototypeProxyTokenSummary } from 'modules/twap'
import { getUsdPriceStateKey, useUsdPrices } from 'modules/usdAmount'

import { TokenUsdAmounts } from '../types'
import { sumUpUsdAmounts } from '../utils/sumUpUsdAmounts'

interface PrototypeProxySummaryGroup {
  isLoading: boolean
  orderCount: number
  tokenCount: number
  usdAmount: CurrencyAmount<Token> | null
}

interface UsePrototypeProxySummaryParams {
  chainId: SupportedChainId
  activeTokens: PrototypeProxyTokenSummary[]
  claimableTokens: PrototypeProxyTokenSummary[]
}

interface UsePrototypeProxySummaryResult {
  totalInProxy: PrototypeProxySummaryGroup
  claimable: PrototypeProxySummaryGroup
  active: PrototypeProxySummaryGroup
}

export function usePrototypeProxySummary({
  chainId,
  activeTokens,
  claimableTokens,
}: UsePrototypeProxySummaryParams): UsePrototypeProxySummaryResult {
  const allTrackedTokens = useMemo(() => {
    const tokenMap = new Map<string, PrototypeProxyTokenSummary['token']>()

    ;[...activeTokens, ...claimableTokens].forEach(({ token }) => {
      tokenMap.set(getTokenId(token), token)
    })

    return Array.from(tokenMap.values())
  }, [activeTokens, claimableTokens])

  const usdPrices = useUsdPrices(allTrackedTokens)

  return useMemo(() => {
    const active = buildSummaryGroup(chainId, activeTokens, usdPrices)
    const claimable = buildSummaryGroup(chainId, claimableTokens, usdPrices)

    return {
      totalInProxy: mergeSummaryGroups(active, claimable),
      claimable,
      active,
    }
  }, [activeTokens, chainId, claimableTokens, usdPrices])
}

function buildSummaryGroup(
  chainId: SupportedChainId,
  summaries: PrototypeProxyTokenSummary[],
  usdPrices: ReturnType<typeof useUsdPrices>,
): PrototypeProxySummaryGroup {
  const tokenUsdAmounts = summaries.reduce<TokenUsdAmounts>((acc, summary) => {
    const usdPrice = usdPrices[getUsdPriceStateKey(summary.token)]
    const tokenKey = getTokenId(summary.token)

    acc[tokenKey] = {
      token: summary.token,
      balance: BigNumber.from(summary.amount.quotient.toString()),
      usdAmount: usdPrice?.price ? usdPrice.price.quote(summary.amount) : undefined,
      isLoading: !!usdPrice?.isLoading,
    }

    return acc
  }, {})

  const hasTokens = summaries.length > 0
  const hasLoadingPrices = Object.values(tokenUsdAmounts).some(({ isLoading }) => isLoading)
  const usdAmount = hasTokens
    ? sumUpUsdAmounts(chainId, tokenUsdAmounts)
    : CurrencyAmount.fromRawAmount(USDC[chainId] as Token, 0)
  const orderCount = getOrderCount(summaries)

  return {
    isLoading: hasTokens && hasLoadingPrices,
    orderCount,
    tokenCount: summaries.length,
    usdAmount,
  }
}

function getOrderCount(summaries: PrototypeProxyTokenSummary[]): number {
  const orderIds = new Set<string>()

  summaries.forEach(({ orderIds: ids }) => {
    ids.forEach((id) => orderIds.add(id))
  })

  return orderIds.size
}

function mergeSummaryGroups(
  first: PrototypeProxySummaryGroup,
  second: PrototypeProxySummaryGroup,
): PrototypeProxySummaryGroup {
  const usdAmount =
    first.usdAmount && second.usdAmount
      ? first.usdAmount.currency.equals(second.usdAmount.currency)
        ? first.usdAmount.add(second.usdAmount)
        : first.usdAmount
      : first.usdAmount || second.usdAmount || null

  return {
    isLoading: first.isLoading || second.isLoading,
    orderCount: first.orderCount + second.orderCount,
    tokenCount: first.tokenCount + second.tokenCount,
    usdAmount,
  }
}
