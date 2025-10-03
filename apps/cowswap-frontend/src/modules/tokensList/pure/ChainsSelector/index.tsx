import { ReactNode } from 'react'

import { useMediaQuery, useTheme } from '@cowprotocol/common-hooks'
import { isDevelopmentEnv } from '@cowprotocol/common-utils'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { HoverTooltip, Media } from '@cowprotocol/ui'

import { Menu, MenuButton, MenuItem } from '@reach/menu-button'
import { Check, ChevronDown, ChevronUp } from 'react-feather'

import { Field } from 'legacy/state/types'

import { useTradeTypeInfoFromUrl } from 'modules/trade/hooks/useTradeTypeInfoFromUrl'
import { TradeType } from 'modules/trade/types/TradeType'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'

// Number of skeleton shimmers to show during loading state
const LOADING_ITEMS_COUNT = 9

const LoadingShimmerElements = (
  <styledEl.Wrapper>
    {Array.from({ length: LOADING_ITEMS_COUNT }, (_, index) => (
      <styledEl.ChainItem key={index} iconOnly isLoading />
    ))}
  </styledEl.Wrapper>
)

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainId: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  visibleNetworkIcons?: number // Number of network icons to display before showing "More" dropdown
  isLoading: boolean
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function ChainsSelector({
  chains,
  onSelectChain,
  defaultChainId,
  isLoading,
  visibleNetworkIcons = LOADING_ITEMS_COUNT,
}: ChainsSelectorProps): ReactNode {
  const isMobile = useMediaQuery(Media.upToSmall(false))

  const theme = useTheme()
  const tradeTypeInfo = useTradeTypeInfoFromUrl()
  const mode =
    tradeTypeInfo?.tradeType === TradeType.SWAP
      ? 'swap'
      : tradeTypeInfo?.tradeType === TradeType.LIMIT_ORDER
        ? 'limit'
        : tradeTypeInfo?.tradeType === TradeType.ADVANCED_ORDERS
          ? 'twap'
          : 'unknown'
  const isSwapMode = mode === 'swap'
  const { field } = useSelectTokenWidgetState()
  const contextLabel = field === Field.INPUT ? 'sell' : field === Field.OUTPUT ? 'buy' : 'unknown'

  if (isLoading) {
    return LoadingShimmerElements
  }

  const shouldDisplayMore = !isMobile && chains.length > visibleNetworkIcons
  const visibleChains = isMobile ? chains : chains.slice(0, visibleNetworkIcons)
  // Find the selected chain that isn't visible in the main row (so we can display it in the dropdown)
  const selectedMenuChain = !isMobile && chains.find((i) => i.id === defaultChainId && !visibleChains.includes(i))

  return (
    <styledEl.Wrapper>
      {visibleChains.map((chain) => (
        <HoverTooltip
          key={chain.id}
          tooltipCloseDelay={0}
          wrapInContainer={true}
          content={chain.label}
          placement="bottom"
        >
          {(() => {
            const clickEvent = toCowSwapGtmEvent({
              category: CowSwapAnalyticsCategory.TRADE,
              action: 'network_selected',
              label: `Chain: ${chain.id}, Previous: ${defaultChainId || 'none'}, Context: ${contextLabel}, Mode: ${mode}, CrossChain: ${isSwapMode && chains.length > 1}`,
            })
            return (
              <styledEl.ChainItem
                active$={defaultChainId === chain.id}
                onClick={() => {
                  if (isSwapMode && isDevelopmentEnv()) {
                    try {
                      console.debug('[GTM click]', JSON.parse(clickEvent))
                    } catch {
                      console.debug('[GTM click]', clickEvent)
                    }
                  }
                  onSelectChain(chain)
                }}
                iconOnly
                data-click-event={isSwapMode ? clickEvent : undefined}
              >
                <img src={theme.darkMode ? chain.logo.dark : chain.logo.light} alt={chain.label} loading="lazy" />
              </styledEl.ChainItem>
            )
          })()}
        </HoverTooltip>
      ))}
      {shouldDisplayMore && (
        <Menu as={styledEl.MenuWrapper}>
          {({ isOpen }) => (
            <>
              <MenuButton as={styledEl.ChainItem} active$={!!selectedMenuChain}>
                {selectedMenuChain ? (
                  <img
                    src={theme.darkMode ? selectedMenuChain.logo.dark : selectedMenuChain.logo.light}
                    alt={selectedMenuChain.label}
                    loading="lazy"
                  />
                ) : isOpen ? (
                  <span>Less</span>
                ) : (
                  <span>More</span>
                )}
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </MenuButton>
              <styledEl.MenuListStyled portal={false}>
                {chains.map((chain) =>
                  (() => {
                    const clickEvent = toCowSwapGtmEvent({
                      category: CowSwapAnalyticsCategory.TRADE,
                      action: 'network_selected',
                      label: `Chain: ${chain.id}, Previous: ${defaultChainId || 'none'}, Context: ${contextLabel}, Mode: ${mode}, CrossChain: ${isSwapMode && chains.length > 1}`,
                    })
                    return (
                      <MenuItem
                        key={chain.id}
                        as={styledEl.ChainItem}
                        onSelect={() => {
                          if (isSwapMode && isDevelopmentEnv()) {
                            try {
                              console.debug('[GTM click]', JSON.parse(clickEvent))
                            } catch {
                              console.debug('[GTM click]', clickEvent)
                            }
                          }
                          onSelectChain(chain)
                        }}
                        active$={defaultChainId === chain.id}
                        iconSize={21}
                        tabIndex={0}
                        borderless
                        data-click-event={isSwapMode ? clickEvent : undefined}
                      >
                        <img
                          src={theme.darkMode ? chain.logo.dark : chain.logo.light}
                          alt={chain.label}
                          loading="lazy"
                        />
                        <span>{chain.label}</span>
                        {chain.id === defaultChainId && <Check size={16} />}
                      </MenuItem>
                    )
                  })(),
                )}
              </styledEl.MenuListStyled>
            </>
          )}
        </Menu>
      )}
    </styledEl.Wrapper>
  )
}
