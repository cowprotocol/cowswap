import { ReactNode } from 'react'

import OrderCheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'
import { getChainAccentColors } from '@cowprotocol/ui'

import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import type { ChainAccentVars } from './styled'

const LOADING_ITEMS_COUNT = 10
const LOADING_SKELETON_INDICES = Array.from({ length: LOADING_ITEMS_COUNT }, (_, index) => index)

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainId: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  isLoading: boolean
  disabledChainIds?: Set<number>
}

export function ChainsSelector({
  chains,
  onSelectChain,
  defaultChainId,
  isLoading,
  disabledChainIds,
}: ChainsSelectorProps): ReactNode {
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
      disabledChainIds={disabledChainIds}
    />
  )
}

function ChainsLoadingList(): ReactNode {
  return (
    <styledEl.List>
      <ChainsSkeletonList />
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

interface ChainsListProps {
  chains: ChainInfo[]
  defaultChainId?: ChainInfo['id']
  onSelectChain(chain: ChainInfo): void
  isDarkMode: boolean
  disabledChainIds?: Set<number>
}

function ChainsList({
  chains,
  defaultChainId,
  onSelectChain,
  isDarkMode,
  disabledChainIds,
}: ChainsListProps): ReactNode {
  return (
    <styledEl.List>
      <ChainsButtonsList
        chains={chains}
        defaultChainId={defaultChainId}
        onSelectChain={onSelectChain}
        isDarkMode={isDarkMode}
        disabledChainIds={disabledChainIds}
      />
    </styledEl.List>
  )
}

function ChainsButtonsList({
  chains,
  defaultChainId,
  onSelectChain,
  isDarkMode,
  disabledChainIds,
}: ChainsListProps): ReactNode {
  return (
    <>
      {chains.map((chain) => (
        <ChainButton
          key={chain.id}
          chain={chain}
          isActive={defaultChainId === chain.id}
          onSelectChain={onSelectChain}
          isDarkMode={isDarkMode}
          isDisabled={disabledChainIds?.has(chain.id) ?? false}
        />
      ))}
    </>
  )
}

export function getChainAccent(chainId: ChainInfo['id']): ChainAccentVars | undefined {
  const accentConfig = getChainAccentColors(chainId as SupportedChainId)
  if (!accentConfig) {
    return undefined
  }

  return {
    backgroundVar: accentConfig.bgVar,
    borderVar: accentConfig.borderVar,
    accentColorVar: accentConfig.accentVar,
  }
}

interface ChainButtonProps {
  chain: ChainInfo
  isActive: boolean
  isDarkMode: boolean
  onSelectChain(chain: ChainInfo): void
  isDisabled: boolean
}

function ChainButton({ chain, isActive, isDarkMode, onSelectChain, isDisabled }: ChainButtonProps): ReactNode {
  const { i18n } = useLingui()
  const logoSrc = isDarkMode ? chain.logo.dark : chain.logo.light
  const accent = getChainAccent(chain.id)
  const disabledTooltip = i18n._(msg`This destination is not supported for this source chain`)

  const handleClick = (): void => {
    if (!isDisabled) {
      onSelectChain(chain)
    }
  }

  return (
    <styledEl.ChainButton
      onClick={handleClick}
      active$={isActive}
      accent$={accent}
      aria-pressed={isActive}
      aria-disabled={isDisabled}
      disabled$={isDisabled}
      title={isDisabled ? disabledTooltip : undefined}
    >
      <styledEl.ChainInfo>
        <styledEl.ChainLogo>
          <img src={logoSrc} alt={chain.label} loading="lazy" />
        </styledEl.ChainLogo>
        <styledEl.ChainText disabled$={isDisabled}>{chain.label}</styledEl.ChainText>
      </styledEl.ChainInfo>
      {isActive && (
        <styledEl.ActiveIcon aria-hidden="true" accent$={accent} color$={chain.color}>
          <SVG src={OrderCheckIcon} />
        </styledEl.ActiveIcon>
      )}
    </styledEl.ChainButton>
  )
}
