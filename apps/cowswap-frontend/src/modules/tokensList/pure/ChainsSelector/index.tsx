import { ReactNode } from 'react'

import { useMediaQuery, useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { HoverTooltip, Media } from '@cowprotocol/ui'

import { Menu, MenuButton, MenuItem } from '@reach/menu-button'
import { Check, ChevronDown, ChevronUp } from 'react-feather'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types/TradeType'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { createLogger } from 'common/utils/logger'

import * as styledEl from './styled'

// Number of skeleton shimmers to show during loading state
const LOADING_ITEMS_COUNT = 9

function ChainLogo({ chain, isDarkMode, alt }: { chain: ChainInfo; isDarkMode: boolean; alt: string }): ReactNode {
  const src = isDarkMode ? chain.logo.dark : chain.logo.light

  return <img src={src} alt={alt} loading="lazy" />
}

const LoadingShimmerElements = (
  <styledEl.Wrapper>
    {Array.from({ length: LOADING_ITEMS_COUNT }, (_, index) => (
      <styledEl.ChainItem key={index} iconOnly isLoading />
    ))}
  </styledEl.Wrapper>
)

type BuildClickEvent = (chain: ChainInfo) => string

const log = createLogger('ChainsSelector')

export function makeBuildClickEvent(
  defaultChainId: ChainInfo['id'] | undefined,
  contextLabel: 'sell' | 'buy' | 'unknown',
  mode: 'swap' | 'limit' | 'twap' | 'unknown',
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

function handleSelect(
  chain: ChainInfo,
  clickEvent: string,
  onSelectChain: (c: ChainInfo) => void,
  isSwapMode: boolean,
): void {
  if (isSwapMode) {
    try {
      log.debug('[GTM click]', JSON.parse(clickEvent) as unknown)
    } catch {
      log.debug('[GTM click]', clickEvent)
    }
  }

  onSelectChain(chain)
}

function VisibleChainsRow(props: {
  visibleChains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  buildClickEvent: BuildClickEvent
  isSwapMode: boolean
  onSelectChain: (c: ChainInfo) => void
  isDarkMode: boolean
}): ReactNode {
  const { visibleChains, defaultChainId, buildClickEvent, isSwapMode, onSelectChain, isDarkMode } = props

  return (
    <>
      {visibleChains.map((chain) => {
        const clickEvent = buildClickEvent(chain)

        return (
          <HoverTooltip
            key={chain.id}
            tooltipCloseDelay={0}
            wrapInContainer={true}
            content={chain.label}
            placement="bottom"
          >
            <styledEl.ChainItem
              active$={defaultChainId === chain.id}
              onClick={() => handleSelect(chain, clickEvent, onSelectChain, isSwapMode)}
              iconOnly
              data-click-event={isSwapMode ? clickEvent : undefined}
            >
              <ChainLogo chain={chain} isDarkMode={isDarkMode} alt={chain.label} />
            </styledEl.ChainItem>
          </HoverTooltip>
        )
      })}
    </>
  )
}

function MoreMenuSection(props: {
  chains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  selectedMenuChain?: ChainInfo | false
  buildClickEvent: BuildClickEvent
  isSwapMode: boolean
  onSelectChain: (c: ChainInfo) => void
  isDarkMode: boolean
}): ReactNode {
  const { chains, defaultChainId, selectedMenuChain, buildClickEvent, isSwapMode, onSelectChain, isDarkMode } = props

  return (
    <Menu as={styledEl.MenuWrapper}>
      {({ isOpen }) => (
        <>
          <MenuButton as={styledEl.ChainItem} active$={!!selectedMenuChain}>
            {selectedMenuChain ? (
              <ChainLogo chain={selectedMenuChain} isDarkMode={isDarkMode} alt={selectedMenuChain.label} />
            ) : isOpen ? (
              <span>Less</span>
            ) : (
              <span>More</span>
            )}
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </MenuButton>
          <styledEl.MenuListStyled portal={false}>
            {chains.map((chain) => {
              const clickEvent = buildClickEvent(chain)

              return (
                <MenuItem
                  key={chain.id}
                  as={styledEl.ChainItem}
                  onSelect={() => handleSelect(chain, clickEvent, onSelectChain, isSwapMode)}
                  active$={defaultChainId === chain.id}
                  iconSize={21}
                  tabIndex={0}
                  borderless
                  data-click-event={isSwapMode ? clickEvent : undefined}
                >
                  <ChainLogo chain={chain} isDarkMode={isDarkMode} alt={chain.label} />
                  <span>{chain.label}</span>
                  {chain.id === defaultChainId && <Check size={16} />}
                </MenuItem>
              )
            })}
          </styledEl.MenuListStyled>
        </>
      )}
    </Menu>
  )
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
  const mode: 'swap' | 'limit' | 'twap' | 'unknown' =
    tradeType === TradeType.SWAP
      ? 'swap'
      : tradeType === TradeType.LIMIT_ORDER
        ? 'limit'
        : tradeType === TradeType.ADVANCED_ORDERS
          ? 'twap'
          : 'unknown'
  const isSwapMode = mode === 'swap'
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
