import { useCallback, useEffect, useMemo, useState } from 'react'

import { gql } from '@apollo/client'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { NATIVE_TOKEN_PER_NETWORK } from 'const'
import { subgraphApiSDK } from 'cowSdk'
import { startOfToday, startOfYesterday, subDays, subHours } from 'date-fns'
import { UTCTimestamp } from 'lightweight-charts'
import { Network, UiError } from 'types'
import { getPercentageDifference, isNativeToken } from 'utils'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useGetTokens(networkId: Network | undefined): GetTokensResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [tokens, setTokens] = useState<Token[]>([])

  const processTokenData = useCallback(
    (data: SubgraphHistoricalDataResponse, lastDayUsdVolume: number, timestamp: number) => {
      const { averagePrice: priceUsd } = data.tokenHourlyTotals[0]
      const lastDayTimestampFrom = Number(lastHoursTimestamp(25))
      const lastDayTimestampTo = Number(lastHoursTimestamp(23))
      const lastWeekTimestampFrom = Number(lastDaysTimestamp(8))
      const lastWeekTimestampTo = Number(lastDaysTimestamp(6))
      const lastDayPrice = data.tokenHourlyTotals.find(
        (x) => x.timestamp >= lastDayTimestampFrom && x.timestamp <= lastDayTimestampTo
      )?.averagePrice
      const lastWeekPrice = data.tokenHourlyTotals.find(
        (x) => x.timestamp >= lastWeekTimestampFrom && x.timestamp <= lastWeekTimestampTo
      )?.averagePrice

      return {
        timestamp,
        lastDayUsdVolume,
        lastDayPricePercentageDifference: lastDayPrice
          ? getPercentageDifference(Number(priceUsd), Number(lastDayPrice))
          : undefined,
        lastWeekPricePercentageDifference: lastWeekPrice
          ? getPercentageDifference(Number(priceUsd), Number(lastWeekPrice))
          : undefined,
        lastWeekUsdPrices: data.tokenHourlyTotals
          .map((x) => ({
            time: Number(x.timestamp) as UTCTimestamp,
            value: Number(x.averagePrice),
          }))
          .sort((a, b) => a.time - b.time),
      }
    },
    []
  )

  const fetchTokens = useCallback(
    async (network: Network): Promise<void> => {
      setIsLoading(true)
      setTokens([])
      const todayTimestamp = startOfToday().setUTCHours(0) / 1000
      const yesterdayTimestamp = startOfYesterday().setUTCHours(0) / 1000
      const lastWeekTimestamp = Number(lastDaysTimestamp(8)) // last 8 days
      try {
        const response = await subgraphApiSDK.runQuery<{ tokenDailyTotals: TokenDailyTotalsResponse[] }>(
          GET_TOKENS_QUERY,
          {
            todayTimestamp,
            yesterdayTimestamp,
            lastWeekTimestamp,
          },
          { chainId: network }
        )
        if (response) {
          const tokensData: { [tokenId: string]: TokenData } = {}
          for (const tokenDailyTotal of response.tokenDailyTotals) {
            const { token, totalVolumeUsd, timestamp } = tokenDailyTotal
            const tokenData = processTokenData(
              { tokenHourlyTotals: token.hourlyTotals },
              Number(totalVolumeUsd),
              timestamp
            )
            tokensData[token.address] = { ...tokenData }
          }
          const tokens = addHistoricalData(
            response.tokenDailyTotals.map((tokenDaily) => tokenDaily.token),
            tokensData
          )
          setTokens(enhanceNativeToken(tokens, network))
        }
      } catch (e) {
        const msg = `Failed to fetch tokens`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [processTokenData]
  )

  useEffect(() => {
    if (!networkId) {
      return
    }

    fetchTokens(networkId)
  }, [fetchTokens, networkId])

  return useMemo(() => ({ tokens, error, isLoading }), [tokens, error, isLoading])
}

type GetTokensResult = {
  tokens: Token[]
  error?: UiError
  isLoading: boolean
}

export const GET_TOKENS_QUERY = gql`
  query GetTokens($todayTimestamp: Int!, $yesterdayTimestamp: Int!, $lastWeekTimestamp: Int!) {
    tokenDailyTotals(
      first: 50
      orderBy: totalVolumeUsd
      orderDirection: desc
      where: { timestamp_gte: $yesterdayTimestamp, timestamp_lt: $todayTimestamp }
    ) {
      timestamp
      totalVolumeUsd
      token {
        id
        address
        name
        symbol
        decimals
        totalVolumeUsd
        priceUsd
        hourlyTotals(
          first: 1000
          orderBy: timestamp
          orderDirection: desc
          where: { timestamp_gt: $lastWeekTimestamp }
        ) {
          timestamp
          averagePrice
        }
      }
    }
  }
`

export type TokenDailyTotalsResponse = {
  timestamp: number
  totalVolumeUsd: string
  token: TokenResponse
}
export type TokenResponse = {
  id: string
  name: string
  symbol: string
  address: string
  decimals: number
  priceUsd: string
  totalVolumeUsd: string
  hourlyTotals: TokenHourlyTotals[]
}

export type TokenHourlyTotals = {
  token: { address: string }
  timestamp: number
  totalVolumeUsd: string
  averagePrice: string
}

export type SubgraphHistoricalDataResponse = {
  tokenHourlyTotals: Array<TokenHourlyTotals>
}

export type Token = {
  lastDayPricePercentageDifference?: number | null
  lastWeekPricePercentageDifference?: number | null
  lastDayUsdVolume?: number | null
  timestamp?: number | null
  lastWeekUsdPrices?: Array<{ time: UTCTimestamp; value: number }> | null
} & TokenResponse &
  TokenErc20

function addHistoricalData(tokens: Token[], prices: { [tokenId: string]: TokenData }): Token[] {
  for (const address of Object.keys(prices)) {
    const token = tokens.find((token) => token.address.toLowerCase() === address.toLowerCase())
    const values = prices[address]
    if (token) {
      token.timestamp = values.timestamp
      token.lastDayUsdVolume = values.lastDayUsdVolume
      token.lastDayPricePercentageDifference = values.lastDayPricePercentageDifference
      token.lastWeekPricePercentageDifference = values.lastWeekPricePercentageDifference
      token.lastWeekUsdPrices = values.lastWeekUsdPrices
    }
  }
  return tokens.sort((a, b) => (b.lastDayUsdVolume ?? -1) - (a.lastDayUsdVolume ?? -1))
}

export type TokenData = {
  timestamp: number
  lastDayUsdVolume?: number
  lastDayPricePercentageDifference?: number
  lastWeekPricePercentageDifference?: number
  lastWeekUsdPrices?: Array<{ time: UTCTimestamp; value: number }>
}

function lastHoursTimestamp(n: number): string {
  return (subHours(new Date(), n).getTime() / 1000).toFixed(0)
}

function lastDaysTimestamp(n: number): string {
  return (subDays(new Date(), n).getTime() / 1000).toFixed(0)
}

function enhanceNativeToken(tokens: TokenResponse[], network: Network): TokenResponse[] {
  return tokens.map((token) => {
    if (!isNativeToken(token.address)) {
      return token
    }
    return {
      ...token,
      ...NATIVE_TOKEN_PER_NETWORK[network],
    }
  })
}
