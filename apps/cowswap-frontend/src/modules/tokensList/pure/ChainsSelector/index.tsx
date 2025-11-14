import { ReactNode } from 'react'

import OrderCheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import type { ChainAccentVars } from './styled'

const LOADING_ITEMS_COUNT = 10
const LOADING_SKELETON_INDICES = Array.from({ length: LOADING_ITEMS_COUNT }, (_, index) => index)

const CHAIN_ACCENT_VAR_MAP: Record<SupportedChainId, ChainAccentVars> = {
  [SupportedChainId.MAINNET]: {
    backgroundVar: UI.COLOR_CHAIN_ETHEREUM_BG,
    borderVar: UI.COLOR_CHAIN_ETHEREUM_BORDER,
    accentColorVar: UI.COLOR_CHAIN_ETHEREUM_ACCENT,
  },
  [SupportedChainId.BNB]: {
    backgroundVar: UI.COLOR_CHAIN_BNB_BG,
    borderVar: UI.COLOR_CHAIN_BNB_BORDER,
    accentColorVar: UI.COLOR_CHAIN_BNB_ACCENT,
  },
  [SupportedChainId.BASE]: {
    backgroundVar: UI.COLOR_CHAIN_BASE_BG,
    borderVar: UI.COLOR_CHAIN_BASE_BORDER,
    accentColorVar: UI.COLOR_CHAIN_BASE_ACCENT,
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    backgroundVar: UI.COLOR_CHAIN_ARBITRUM_BG,
    borderVar: UI.COLOR_CHAIN_ARBITRUM_BORDER,
    accentColorVar: UI.COLOR_CHAIN_ARBITRUM_ACCENT,
  },
  [SupportedChainId.POLYGON]: {
    backgroundVar: UI.COLOR_CHAIN_POLYGON_BG,
    borderVar: UI.COLOR_CHAIN_POLYGON_BORDER,
    accentColorVar: UI.COLOR_CHAIN_POLYGON_ACCENT,
  },
  [SupportedChainId.AVALANCHE]: {
    backgroundVar: UI.COLOR_CHAIN_AVALANCHE_BG,
    borderVar: UI.COLOR_CHAIN_AVALANCHE_BORDER,
    accentColorVar: UI.COLOR_CHAIN_AVALANCHE_ACCENT,
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    backgroundVar: UI.COLOR_CHAIN_GNOSIS_BG,
    borderVar: UI.COLOR_CHAIN_GNOSIS_BORDER,
    accentColorVar: UI.COLOR_CHAIN_GNOSIS_ACCENT,
  },
  [SupportedChainId.LENS]: {
    backgroundVar: UI.COLOR_CHAIN_LENS_BG,
    borderVar: UI.COLOR_CHAIN_LENS_BORDER,
    accentColorVar: UI.COLOR_CHAIN_LENS_ACCENT,
  },
  [SupportedChainId.SEPOLIA]: {
    backgroundVar: UI.COLOR_CHAIN_SEPOLIA_BG,
    borderVar: UI.COLOR_CHAIN_SEPOLIA_BORDER,
    accentColorVar: UI.COLOR_CHAIN_SEPOLIA_ACCENT,
  },
  [SupportedChainId.LINEA]: {
    backgroundVar: UI.COLOR_CHAIN_LINEA_BG,
    borderVar: UI.COLOR_CHAIN_LINEA_BORDER,
    accentColorVar: UI.COLOR_CHAIN_LINEA_ACCENT,
  },
  [SupportedChainId.PLASMA]: {
    backgroundVar: UI.COLOR_CHAIN_PLASMA_BG,
    borderVar: UI.COLOR_CHAIN_PLASMA_BORDER,
    accentColorVar: UI.COLOR_CHAIN_PLASMA_ACCENT,
  },
}

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
    <ChainsList chains={chains} defaultChainId={defaultChainId} onSelectChain={onSelectChain} isDarkMode={darkMode} />
  )
}

function ChainsLoadingList(): ReactNode {
  const skeletonRows = renderChainSkeletonRows()

  return <styledEl.List>{skeletonRows}</styledEl.List>
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

  return <styledEl.List>{chainButtons}</styledEl.List>
}

interface ChainButtonsRenderProps extends ChainsListProps {}

function renderChainButtons({
  chains,
  defaultChainId,
  onSelectChain,
  isDarkMode,
}: ChainButtonsRenderProps): ReactNode[] {
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

export function getChainAccent(chainId: ChainInfo['id']): ChainAccentVars | undefined {
  return CHAIN_ACCENT_VAR_MAP[chainId as SupportedChainId]
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
        <styledEl.ActiveIcon aria-hidden="true" accent$={accent} color$={chain.color}>
          <SVG src={OrderCheckIcon} />
        </styledEl.ActiveIcon>
      )}
    </styledEl.ChainButton>
  )
}
