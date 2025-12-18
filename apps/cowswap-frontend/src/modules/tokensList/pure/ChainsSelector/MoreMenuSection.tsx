import { ReactNode } from 'react'

import type { ChainInfo } from '@cowprotocol/cow-sdk'

import { Menu, MenuButton, MenuItem } from '@reach/menu-button'
import { Check, ChevronDown } from 'react-feather'

import { ChainLogo } from './ChainLogo'
import * as styledEl from './styled'

export interface MoreMenuSectionProps {
  chains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  selectedMenuChain?: ChainInfo
  buildClickEvent: (chain: ChainInfo) => string
  isSwapMode: boolean
  onSelectChain: (chain: ChainInfo) => void
}

export function MoreMenuSection({
  chains,
  defaultChainId,
  selectedMenuChain,
  buildClickEvent,
  isSwapMode,
  onSelectChain,
}: MoreMenuSectionProps): ReactNode {
  const buttonContent = selectedMenuChain ? (
    <ChainLogo chain={selectedMenuChain} alt={selectedMenuChain.label} />
  ) : (
    <span>More</span>
  )

  return (
    <Menu as={styledEl.MenuWrapper}>
      <MenuButton as={styledEl.ChainItem} active$={!!selectedMenuChain}>
        {buttonContent}
        <ChevronDown size={16} />
      </MenuButton>
      <styledEl.MenuListStyled portal={false}>
        {chains.map((chain) => {
          const clickEvent = buildClickEvent(chain)
          const handleSelect = (): void => {
            onSelectChain(chain)
          }

            return (
              <MenuItem
                key={chain.id}
                as={styledEl.ChainItem}
                onSelect={handleSelect}
                active$={defaultChainId === chain.id}
                iconSize={21}
                tabIndex={0}
                borderless
                data-click-event={isSwapMode ? clickEvent : undefined}
              >
                <ChainLogo chain={chain} alt={chain.label} />
                <span>{chain.label}</span>
                {chain.id === defaultChainId && <Check size={16} />}
              </MenuItem>
          )
        })}
      </styledEl.MenuListStyled>
    </Menu>
  )
}
