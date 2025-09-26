import { ReactNode } from 'react'

import type { ChainInfo } from '@cowprotocol/cow-sdk'

import { Menu, MenuButton, MenuItem } from '@reach/menu-button'
import { Check, ChevronDown, ChevronUp } from 'react-feather'

import { ChainLogo } from './ChainLogo'
import * as styledEl from './styled'

export interface MoreMenuSectionProps {
  chains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  selectedMenuChain?: ChainInfo
  buildClickEvent: (chain: ChainInfo) => string
  isSwapMode: boolean
  onSelectChain: (chain: ChainInfo) => void
  isDarkMode: boolean
}

export function MoreMenuSection({
  chains,
  defaultChainId,
  selectedMenuChain,
  buildClickEvent,
  isSwapMode,
  onSelectChain,
  isDarkMode,
}: MoreMenuSectionProps): ReactNode {
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
                  onSelect={() => onSelectChain(chain)}
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
