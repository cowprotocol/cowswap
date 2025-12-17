import { ReactNode, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { MoreMenuSection } from './MoreMenuSection'
import * as styledEl from './styled'
import { VisibleChainsRow } from './VisibleChainsRow'

type BuildClickEvent = (chain: ChainInfo) => string

// Number of skeleton shimmers to show during loading state
const LOADING_ITEMS_COUNT = 9

const LoadingShimmerElements = (
  <styledEl.Wrapper>
    {Array.from({ length: LOADING_ITEMS_COUNT }, (_, index) => (
      <styledEl.ChainItem key={index} iconOnly isLoading />
    ))}
  </styledEl.Wrapper>
)

export function makeBuildClickEvent(
  defaultChainId: ChainInfo['id'] | undefined,
  contextLabel: 'sell' | 'buy',
  mode: TradeType,
  counterChainId: ChainInfo['id'] | undefined,
): BuildClickEvent {
  return (chain: ChainInfo) =>
    toCowSwapGtmEvent({
      category: CowSwapAnalyticsCategory.TRADE,
      action: 'network_selected',
      label: `Chain: ${chain.id}, PreviousChain: ${defaultChainId ?? 'none'}, Context: ${contextLabel}, Mode: ${mode}, CrossChain: ${
        mode === TradeType.SWAP && counterChainId !== undefined && counterChainId !== chain.id
      }`,
    })
}

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainInfo: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  visibleNetworkIcons?: number
  isLoading: boolean
  tradeType: TradeType
  field: Field
  counterChainId?: ChainInfo['id']
}

export function ChainsSelector({
  chains,
  onSelectChain,
  defaultChainId,
  isLoading,
  visibleNetworkIcons = LOADING_ITEMS_COUNT,
  tradeType,
  field,
  counterChainId,
}: ChainsSelectorProps): ReactNode {
  const isMobile = useMediaQuery(Media.upToSmall(false))
  const mode = tradeType
  const isSwapMode = tradeType === TradeType.SWAP
  const contextLabel: 'sell' | 'buy' = field === Field.INPUT ? 'sell' : 'buy'

  const buildClickEvent = useMemo(
    () => makeBuildClickEvent(defaultChainId, contextLabel, mode, counterChainId),
    [defaultChainId, contextLabel, mode, counterChainId],
  )

  if (isLoading) {
    return LoadingShimmerElements
  }

  const shouldDisplayMore = !isMobile && chains.length > visibleNetworkIcons
  const visibleChains = isMobile ? chains : chains.slice(0, visibleNetworkIcons)
  const selectedMenuChain = !isMobile
    ? chains.find((chain) => chain.id === defaultChainId && !visibleChains.some((visible) => visible.id === chain.id))
    : undefined

  return (
    <styledEl.Wrapper>
      <VisibleChainsRow
        visibleChains={visibleChains}
        defaultChainId={defaultChainId}
        buildClickEvent={buildClickEvent}
        isSwapMode={isSwapMode}
        onSelectChain={onSelectChain}
      />
      {shouldDisplayMore && (
        <MoreMenuSection
          chains={chains}
          defaultChainId={defaultChainId}
          selectedMenuChain={selectedMenuChain}
          buildClickEvent={buildClickEvent}
          isSwapMode={isSwapMode}
          onSelectChain={onSelectChain}
        />
      )}
    </styledEl.Wrapper>
  )
}
