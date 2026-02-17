import { ChainInfo } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

export type BuildClickEvent = (chain: ChainInfo) => string

export function makeBuildClickEvent(
  defaultChainId: ChainInfo['id'] | undefined,
  contextLabel: 'sell' | 'buy',
  mode: TradeType,
  counterChainId: ChainInfo['id'] | undefined,
): BuildClickEvent {
  const isSwapMode = mode === TradeType.SWAP

  return (chain: ChainInfo) =>
    toCowSwapGtmEvent({
      category: CowSwapAnalyticsCategory.TRADE,
      action: 'network_selected',
      label: `Chain: ${chain.id}, PreviousChain: ${defaultChainId ?? 'none'}, Context: ${contextLabel}, Mode: ${mode}, CrossChain: ${
        isSwapMode && counterChainId !== undefined && counterChainId !== chain.id
      }`,
    })
}
