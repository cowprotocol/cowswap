import { ReactNode } from 'react'

import OrderCheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import SVG from 'react-inlinesvg'

import { getChainAccent } from './getChainAccent'
import * as styledEl from './styled'

export { getChainAccent } from './getChainAccent'

const LOADING_ITEMS_COUNT = 10
const LOADING_SKELETON_INDICES = Array.from({ length: LOADING_ITEMS_COUNT }, (_, index) => index)

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainId: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  isLoading: boolean
}

export function ChainsSelector({ chains, onSelectChain, defaultChainId, isLoading }: ChainsSelectorProps): ReactNode {
  const { darkMode } = useTheme()

  return (
    <styledEl.List>
      {isLoading ? (
        <ChainsSkeletonList />
      ) : (
        <ChainsButtonsList
          chains={chains}
          defaultChainId={defaultChainId}
          onSelectChain={onSelectChain}
          isDarkMode={darkMode}
        />
      )}
    </styledEl.List>
  )
}

function ChainsSkeletonList(): ReactNode {
  return (
    <>
      {LOADING_SKELETON_INDICES.map((index) => (
        <styledEl.LoadingRow key={`chain-skeleton-${index}`}>
          <styledEl.LoadingCircle />
          <styledEl.LoadingBar />
        </styledEl.LoadingRow>
      ))}
    </>
  )
}

interface ChainsButtonsListProps {
  chains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  onSelectChain(chain: ChainInfo): void
  isDarkMode: boolean
}

function ChainsButtonsList({ chains, defaultChainId, onSelectChain, isDarkMode }: ChainsButtonsListProps): ReactNode {
  return (
    <>
      {chains.map((chain) => (
        <ChainButton
          key={chain.id}
          chain={chain}
          isActive={defaultChainId === chain.id}
          onSelectChain={onSelectChain}
          isDarkMode={isDarkMode}
        />
      ))}
    </>
  )
}

interface ChainButtonProps {
  chain: ChainInfo
  isActive: boolean
  isDarkMode: boolean
  onSelectChain(chain: ChainInfo): void
}

function ChainButton({ chain, isActive, isDarkMode, onSelectChain }: ChainButtonProps): ReactNode {
  const logoSrc = isDarkMode ? chain.logo.dark : chain.logo.light
  const accent = getChainAccent(chain.id)

  return (
    <styledEl.ChainButton
      onClick={() => onSelectChain(chain)}
      active$={isActive}
      accent$={accent}
      aria-pressed={isActive}
    >
      <styledEl.ChainInfo>
        <styledEl.ChainLogo>
          <img src={logoSrc} alt={chain.label} loading="lazy" />
        </styledEl.ChainLogo>
        <styledEl.ChainText>{chain.label}</styledEl.ChainText>
      </styledEl.ChainInfo>
      {isActive && (
        <styledEl.ActiveIcon aria-hidden accent$={accent} color$={chain.color}>
          <SVG src={OrderCheckIcon} />
        </styledEl.ActiveIcon>
      )}
    </styledEl.ChainButton>
  )
}
