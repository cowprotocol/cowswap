import { ReactNode } from 'react'

import { useMediaQuery, useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { HoverTooltip, Media } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Menu, MenuButton, MenuItem } from '@reach/menu-button'
import { Check, ChevronDown, ChevronUp } from 'react-feather'

import * as styledEl from './styled'

// Number of skeleton shimmers to show during loading state
const LOADING_ITEMS_COUNT = 10

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

export function ChainsSelector({
  chains,
  onSelectChain,
  defaultChainId,
  isLoading,
  visibleNetworkIcons = LOADING_ITEMS_COUNT,
}: ChainsSelectorProps): ReactNode {
  const isMobile = useMediaQuery(Media.upToSmall(false))

  const theme = useTheme()

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
          <styledEl.ChainItem active$={defaultChainId === chain.id} onClick={() => onSelectChain(chain)} iconOnly>
            <img src={theme.darkMode ? chain.logo.dark : chain.logo.light} alt={chain.label} loading="lazy" />
          </styledEl.ChainItem>
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
                  <span>
                    <Trans>Less</Trans>
                  </span>
                ) : (
                  <span>
                    <Trans>More</Trans>
                  </span>
                )}
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </MenuButton>
              <styledEl.MenuListStyled portal={false}>
                {chains.map((chain) => (
                  <MenuItem
                    key={chain.id}
                    as={styledEl.ChainItem}
                    onSelect={() => onSelectChain(chain)}
                    active$={defaultChainId === chain.id}
                    iconSize={21}
                    tabIndex={0}
                    borderless
                  >
                    <img src={theme.darkMode ? chain.logo.dark : chain.logo.light} alt={chain.label} loading="lazy" />
                    <span>{chain.label}</span>
                    {chain.id === defaultChainId && <Check size={16} />}
                  </MenuItem>
                ))}
              </styledEl.MenuListStyled>
            </>
          )}
        </Menu>
      )}
    </styledEl.Wrapper>
  )
}
