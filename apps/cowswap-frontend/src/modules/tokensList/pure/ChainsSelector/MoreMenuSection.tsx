import { ReactNode } from 'react'

import type { ChainInfo } from '@cowprotocol/cow-sdk'

import { Menu, MenuButton, MenuItem } from '@reach/menu-button'
import { Check, ChevronDown } from 'react-feather'

import { ChainLogo } from './ChainLogo'
import * as styledEl from './styled'

interface MoreMenuItemProps {
  chain: ChainInfo
  defaultChainId?: ChainInfo['id']
  buildClickEvent: (chain: ChainInfo) => string
  isSwapMode: boolean
  onSelectChain: (chain: ChainInfo) => void
  isDarkMode: boolean
}

function MoreMenuItem({
  chain,
  defaultChainId,
  buildClickEvent,
  isSwapMode,
  onSelectChain,
  isDarkMode,
}: MoreMenuItemProps): ReactNode {
  const clickEvent = buildClickEvent(chain)

  return (
    <MenuItem
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
}

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
  const buttonContent = selectedMenuChain ? (
    <ChainLogo chain={selectedMenuChain} isDarkMode={isDarkMode} alt={selectedMenuChain.label} />
  ) : (
    <span>More</span>
  )

  const menuItems: ReactNode[] = []

  for (const chain of chains) {
    menuItems.push(
      <MoreMenuItem
        key={chain.id}
        chain={chain}
        defaultChainId={defaultChainId}
        buildClickEvent={buildClickEvent}
        isSwapMode={isSwapMode}
        onSelectChain={onSelectChain}
        isDarkMode={isDarkMode}
      />,
    )
  }

  return (
    <Menu as={styledEl.MenuWrapper}>
      <MenuButton as={styledEl.ChainItem} active$={!!selectedMenuChain}>
        {buttonContent}
        <ChevronDown size={16} />
      </MenuButton>
      <styledEl.MenuListStyled portal={false}>
        {menuItems}
      </styledEl.MenuListStyled>
    </Menu>
  )
}
