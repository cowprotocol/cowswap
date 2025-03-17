import { ChainInfo } from '@cowprotocol/types'
import { HoverTooltip } from '@cowprotocol/ui'

import { Menu } from '@reach/menu-button'
import { Check, ChevronDown, ChevronUp } from 'react-feather'

import * as styledEl from './styled'

const Shimmer = (
  <styledEl.Wrapper>
    <styledEl.ShimmerItem />
    <styledEl.ShimmerItem />
    <styledEl.ShimmerItem />
    <styledEl.ShimmerItem />
    <styledEl.ShimmerItem />
  </styledEl.Wrapper>
)

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainId: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  itemsToDisplay?: number
  isLoading: boolean
}

export function ChainsSelector({
  chains,
  onSelectChain,
  defaultChainId,
  isLoading,
  // TODO: change the value to 7 after tests
  itemsToDisplay = 3,
}: ChainsSelectorProps) {
  const shouldDisplayMore = chains.length > itemsToDisplay

  const visibleChains = chains.slice(0, itemsToDisplay)
  const menuChains = chains.slice(itemsToDisplay)
  const selectedMenuChain = menuChains.find((i) => i.id === defaultChainId)

  if (isLoading) {
    return Shimmer
  }

  return (
    <styledEl.Wrapper>
      {visibleChains.map((chain) => (
        <HoverTooltip
          key={chain.id}
          tooltipCloseDelay={0}
          wrapInContainer={true}
          content={chain.name}
          placement="bottom"
        >
          <styledEl.ChainButton active$={defaultChainId === chain.id} onClick={() => onSelectChain(chain)}>
            <img src={chain.logoUrl.light} alt={chain.name} />
          </styledEl.ChainButton>
        </HoverTooltip>
      ))}
      {shouldDisplayMore && (
        <styledEl.MenuWrapper>
          <Menu>
            {({ isOpen }) => (
              <>
                <styledEl.MenuButtonStyled active$={!!selectedMenuChain}>
                  <styledEl.TextButton>
                    {selectedMenuChain ? (
                      <styledEl.MenuChainButton>
                        <img src={selectedMenuChain.logoUrl.light} alt={selectedMenuChain.name} />
                      </styledEl.MenuChainButton>
                    ) : isOpen ? (
                      'Less'
                    ) : (
                      'More'
                    )}
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </styledEl.TextButton>
                </styledEl.MenuButtonStyled>
                <styledEl.MenuListStyled portal={false}>
                  {menuChains.map((chain) => (
                    <styledEl.MenuItemStyled key={chain.id} onSelect={() => onSelectChain(chain)} tabIndex={0}>
                      {selectedMenuChain?.id === chain.id && <Check size={16} />}
                      <styledEl.MenuChainButton>
                        <img src={chain.logoUrl.light} alt={chain.name} />
                      </styledEl.MenuChainButton>
                      <span>{chain.name}</span>
                    </styledEl.MenuItemStyled>
                  ))}
                </styledEl.MenuListStyled>
              </>
            )}
          </Menu>
        </styledEl.MenuWrapper>
      )}
    </styledEl.Wrapper>
  )
}
