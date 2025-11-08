import { ReactNode } from 'react'

import OrderCheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

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

  if (isLoading) {
    return <ChainsLoadingList />
  }

  return (
    <ChainsList
      chains={chains}
      defaultChainId={defaultChainId}
      onSelectChain={onSelectChain}
      isDarkMode={darkMode}
    />
  )
}

function ChainsLoadingList(): ReactNode {
  const skeletonRows = renderChainSkeletonRows()

  return (
    <styledEl.List>
      {skeletonRows}
    </styledEl.List>
  )
}

function renderChainSkeletonRows(): ReactNode[] {
  const elements: ReactNode[] = []

  for (const index of LOADING_SKELETON_INDICES) {
    elements.push(
      <styledEl.LoadingRow key={`chain-skeleton-${index}`}>
        <styledEl.LoadingCircle />
        <styledEl.LoadingBar />
      </styledEl.LoadingRow>,
    )
  }

  return elements
}

interface ChainsListProps {
  chains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  onSelectChain(chain: ChainInfo): void
  isDarkMode: boolean
}

function ChainsList({ chains, defaultChainId, onSelectChain, isDarkMode }: ChainsListProps): ReactNode {
  const chainButtons = renderChainButtons({ chains, defaultChainId, onSelectChain, isDarkMode })

  return (
    <styledEl.List>
      {chainButtons}
    </styledEl.List>
  )
}

interface ChainButtonsRenderProps extends ChainsListProps {}

function renderChainButtons({ chains, defaultChainId, onSelectChain, isDarkMode }: ChainButtonsRenderProps): ReactNode[] {
  const elements: ReactNode[] = []

  for (const chain of chains) {
    elements.push(
      <ChainButton
        key={chain.id}
        chain={chain}
        isActive={defaultChainId === chain.id}
        onSelectChain={onSelectChain}
        isDarkMode={isDarkMode}
      />,
    )
  }

  return elements
}

interface ChainButtonProps {
  chain: ChainInfo
  isActive: boolean
  isDarkMode: boolean
  onSelectChain(chain: ChainInfo): void
}

function ChainButton({ chain, isActive, isDarkMode, onSelectChain }: ChainButtonProps): ReactNode {
  const logoSrc = isDarkMode ? chain.logo.dark : chain.logo.light

  return (
    <styledEl.ChainButton onClick={() => onSelectChain(chain)} active$={isActive} aria-pressed={isActive}>
      <styledEl.ChainInfo>
        <styledEl.ChainLogo>
          <img src={logoSrc} alt={chain.label} loading="lazy" />
        </styledEl.ChainLogo>
        <styledEl.ChainText>{chain.label}</styledEl.ChainText>
      </styledEl.ChainInfo>
      {isActive && (
        <styledEl.ActiveIcon aria-hidden="true">
          <SVG src={OrderCheckIcon} />
        </styledEl.ActiveIcon>
      )}
    </styledEl.ChainButton>
  )
}
