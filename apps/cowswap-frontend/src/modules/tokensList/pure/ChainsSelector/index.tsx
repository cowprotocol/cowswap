import { ReactNode } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import { Check } from 'react-feather'

import * as styledEl from './styled'

// Number of skeleton shimmers to show during loading state
const LOADING_ITEMS_COUNT = 10

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainId: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  isLoading: boolean
}

export function ChainsSelector({ chains, onSelectChain, defaultChainId, isLoading }: ChainsSelectorProps): ReactNode {
  const theme = useTheme()

  if (isLoading) {
    return (
      <styledEl.List>
        {Array.from({ length: LOADING_ITEMS_COUNT }, (_, index) => (
          <styledEl.LoadingRow key={index}>
            <styledEl.LoadingCircle />
            <styledEl.LoadingBar />
          </styledEl.LoadingRow>
        ))}
      </styledEl.List>
    )
  }

  return (
    <styledEl.List>
      {chains.map((chain) => {
        const isActive = defaultChainId === chain.id

        return (
          <styledEl.ChainButton
            key={chain.id}
            onClick={() => onSelectChain(chain)}
            active$={isActive}
            aria-pressed={isActive}
          >
            <styledEl.ChainInfo>
              <styledEl.ChainLogo>
                <img src={theme.darkMode ? chain.logo.dark : chain.logo.light} alt={chain.label} loading="lazy" />
              </styledEl.ChainLogo>
              <styledEl.ChainText>{chain.label}</styledEl.ChainText>
            </styledEl.ChainInfo>
            {isActive && (
              <styledEl.ActiveIcon>
                <Check size={16} />
              </styledEl.ActiveIcon>
            )}
          </styledEl.ChainButton>
        )
      })}
    </styledEl.List>
  )
}
