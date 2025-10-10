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
  contextLabel: 'sell' | 'buy' | 'unknown',
  mode: TradeType | 'unknown',
  counterChainId: ChainInfo['id'] | undefined,
  isSwapMode: boolean,
): BuildClickEvent {
  return (chain: ChainInfo) =>
    toCowSwapGtmEvent({
      category: CowSwapAnalyticsCategory.TRADE,
      action: 'network_selected',
      label: `Chain: ${chain.id}, PreviousChain: ${defaultChainId || 'none'}, Context: ${contextLabel}, Mode: ${mode}, CrossChain: ${
        isSwapMode && counterChainId !== undefined ? counterChainId !== chain.id : false
      }`,
    })
}
export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainId: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  visibleNetworkIcons?: number // Number of network icons to display before showing "More" dropdown
  isLoading: boolean
  tradeType?: TradeType
  field?: Field
  isDarkMode?: boolean
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
  isDarkMode = false,
  counterChainId,
}: ChainsSelectorProps): ReactNode {
  const isMobile = useMediaQuery(Media.upToSmall(false))
  const mode = tradeType || 'unknown'
  const isSwapMode = tradeType === TradeType.SWAP
  const contextLabel: 'sell' | 'buy' | 'unknown' =
    field === Field.INPUT ? 'sell' : field === Field.OUTPUT ? 'buy' : 'unknown'

  const buildClickEvent = useMemo(
    () => makeBuildClickEvent(defaultChainId, contextLabel, mode, counterChainId, isSwapMode),
    [defaultChainId, contextLabel, mode, counterChainId, isSwapMode],
  )

  if (isLoading) {
    return LoadingShimmerElements
  }

  const shouldDisplayMore = !isMobile && chains.length > visibleNetworkIcons
  const visibleChains = isMobile ? chains : chains.slice(0, visibleNetworkIcons)
  // Find the selected chain that isn't visible in the main row (so we can display it in the dropdown)
  const selectedMenuChain =
    !isMobile && chains.find((i) => i.id === defaultChainId && !visibleChains.some((v) => v.id === i.id))

  return (
    <styledEl.Wrapper>
      <VisibleChainsRow
        visibleChains={visibleChains}
        defaultChainId={defaultChainId}
        buildClickEvent={buildClickEvent}
        isSwapMode={isSwapMode}
        onSelectChain={onSelectChain}
        isDarkMode={isDarkMode}
      />
      {shouldDisplayMore && (
        <MoreMenuSection
          chains={chains}
          defaultChainId={defaultChainId}
          selectedMenuChain={selectedMenuChain || undefined}
          buildClickEvent={buildClickEvent}
          isSwapMode={isSwapMode}
          onSelectChain={onSelectChain}
          isDarkMode={isDarkMode}
        />
      )}
    </styledEl.Wrapper>
  )
}
