import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { MostTradingToken } from '../containers/Messages/MostTradingToken'
import { MostUsingToken } from '../containers/Messages/MostUsingToken'
import { MessageType, NfaSourceData } from '../types'

const DEFAULT_DATA: Record<MessageType, NfaSourceData[]> = {
  [MessageType.BUY_ORDER]: [],
  [MessageType.SELL_ORDER]: [],
  [MessageType.BUY_USERS]: [],
  [MessageType.SELL_USERS]: [],
}

export function analyzeNfaSources(sources: NfaSourceData[], chainId: SupportedChainId): JSX.Element[] {
  const result = sources.reduce(
    (acc, source) => {
      acc[source.message].push(source)

      return acc
    },
    { ...DEFAULT_DATA }
  )
  const buyOrders = result[MessageType.BUY_ORDER]
  const sellOrders = result[MessageType.SELL_ORDER]
  const buyUsers = result[MessageType.BUY_USERS]
  const sellUsers = result[MessageType.SELL_USERS]

  const buyNativeMessage = getEthBuyMessage(buyOrders, chainId)

  const mostBuyingMessage = getMostTradingMessage('buying', buyOrders, chainId)
  const mostSellingMessage = getMostTradingMessage('selling', sellOrders, chainId)

  const mostUsingBuyMessage = getMostUsingMessage('bought', buyUsers, chainId)
  const mostUsingSellMessage = getMostUsingMessage('sold', sellUsers, chainId)

  return [buyNativeMessage, mostBuyingMessage, mostSellingMessage, mostUsingBuyMessage, mostUsingSellMessage].filter(
    isTruthy
  )
}

function getEthBuyMessage(data: NfaSourceData[], chainId: SupportedChainId): JSX.Element | null {
  const nativeToken = NATIVE_CURRENCIES[chainId]
  const nativeBuy = data.find((source) => source.token.toLowerCase() === nativeToken.address.toLowerCase())

  if (!nativeBuy) return null

  if (nativeBuy.percent < 0.4) return null

  return (
    <>
      `Wow! ${Math.round(nativeBuy.percent * 100)}% of the buy orders are in ${nativeToken.symbol}!`
    </>
  )
}

function getMostUsingMessage(type: string, data: NfaSourceData[], chainId: SupportedChainId): JSX.Element | null {
  const nativeToken = NATIVE_CURRENCIES[chainId]
  const { token: tokenAddress, percent: percentRaw } = getTheMostToken(data, nativeToken.address)

  const percent = formatPercent(percentRaw)

  return <MostUsingToken type={type} tokenAddress={tokenAddress} percent={percent} />
}

function getMostTradingMessage(type: string, data: NfaSourceData[], chainId: SupportedChainId): JSX.Element | null {
  const nativeToken = NATIVE_CURRENCIES[chainId]
  const { token: tokenAddress, percent: percentRaw } = getTheMostToken(data, nativeToken.address)

  const percent = formatPercent(percentRaw)

  return <MostTradingToken type={type} tokenAddress={tokenAddress} percent={percent} />
}

function formatPercent(percentRaw: number): number {
  return +(percentRaw * 100).toFixed(2)
}

function getTheMostToken(data: NfaSourceData[], nativeTokenAddress: string): NfaSourceData {
  return data
    .filter(({ token }) => token.toLowerCase() !== nativeTokenAddress.toLowerCase())
    .sort((a, b) => b.percent - a.percent)[0]
}
