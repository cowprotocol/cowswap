import { ReactNode } from 'react'

import { useMediaQuery, useTheme } from '@cowprotocol/common-hooks'
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
  isSwapMode: boolean,
  chainsCount: number,
): BuildClickEvent {
  return (chain: ChainInfo) =>
    toCowSwapGtmEvent({
      category: CowSwapAnalyticsCategory.TRADE,
      action: 'network_selected',
      label: `Chain: ${chain.id}, PreviousChain: ${defaultChainId || 'none'}, Context: ${contextLabel}, Mode: ${mode}, CrossChain: ${
        isSwapMode && chainsCount > 1
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
}

export function ChainsSelector({
  chains,
  onSelectChain,
  defaultChainId,
  isLoading,
  visibleNetworkIcons = LOADING_ITEMS_COUNT,
  tradeType,
  field,
}: ChainsSelectorProps): ReactNode {
  const isMobile = useMediaQuery(Media.upToSmall(false))
  const theme = useTheme()
  const mode = tradeType || 'unknown'
  const isSwapMode = tradeType === TradeType.SWAP
  const contextLabel: 'sell' | 'buy' | 'unknown' =
    field === Field.INPUT ? 'sell' : field === Field.OUTPUT ? 'buy' : 'unknown'

  if (isLoading) {
    return LoadingShimmerElements
  }

  const shouldDisplayMore = !isMobile && chains.length > visibleNetworkIcons
  const visibleChains = isMobile ? chains : chains.slice(0, visibleNetworkIcons)
  // Find the selected chain that isn't visible in the main row (so we can display it in the dropdown)
  const selectedMenuChain = !isMobile && chains.find((i) => i.id === defaultChainId && !visibleChains.includes(i))

  const buildClickEvent = makeBuildClickEvent(defaultChainId, contextLabel, mode, isSwapMode, chains.length)

  return (
    <styledEl.Wrapper>
      <VisibleChainsRow
        visibleChains={visibleChains}
        defaultChainId={defaultChainId}
        buildClickEvent={buildClickEvent}
        isSwapMode={isSwapMode}
        onSelectChain={onSelectChain}
        isDarkMode={theme.darkMode}
      />
      {shouldDisplayMore && (
        <MoreMenuSection
          chains={chains}
          defaultChainId={defaultChainId}
          selectedMenuChain={selectedMenuChain || undefined}
          buildClickEvent={buildClickEvent}
          isSwapMode={isSwapMode}
          onSelectChain={onSelectChain}
          isDarkMode={theme.darkMode}
        />
      )}
    </styledEl.Wrapper>
  )
}
