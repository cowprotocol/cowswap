import { ReactNode, useMemo, useState } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'
import { BackButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

import { ChainsToSelectState } from '../../types'
import { ChainsSelector } from '../ChainsSelector'

const EMPTY_CHAINS: ChainInfo[] = []

export interface ChainPanelProps {
  title: string
  chainsState: ChainsToSelectState | undefined
  onSelectChain(chain: ChainInfo): void
  variant?: 'default' | 'fullscreen'
  onClose?(): void
}

export function ChainPanel({
  title,
  chainsState,
  onSelectChain,
  variant = 'default',
  onClose,
}: ChainPanelProps): ReactNode {
  const [chainQuery, setChainQuery] = useState('')
  const chains = chainsState?.chains ?? EMPTY_CHAINS
  const isLoading = chainsState?.isLoading ?? false
  const normalizedChainQuery = chainQuery.trim().toLowerCase()

  const filteredChains = useMemo(
    () => filterChainsByQuery(chains, normalizedChainQuery),
    [chains, normalizedChainQuery],
  )

  const { showSearchEmptyState, showUnavailableState } = getEmptyStateFlags({
    filteredChainsLength: filteredChains.length,
    isLoading,
    normalizedChainQuery,
    totalChains: chains.length,
  })

  return (
    <styledEl.Panel $variant={variant}>
      <ChainPanelHeader onClose={onClose} title={title} variant={variant} />
      <styledEl.PanelSearchInputWrapper>
        <styledEl.PanelSearchInput
          value={chainQuery}
          onChange={(event) => setChainQuery(event.target.value)}
          placeholder={t`Search network`}
        />
      </styledEl.PanelSearchInputWrapper>
      <styledEl.PanelList>
        <ChainsSelector
          isLoading={isLoading}
          chains={filteredChains}
          defaultChainId={chainsState?.defaultChainId}
          onSelectChain={onSelectChain}
        />
        {showUnavailableState && <styledEl.EmptyState>{t`No networks available for this trade.`}</styledEl.EmptyState>}
        {showSearchEmptyState && (
          <styledEl.EmptyState>
            <Trans>No networks match {chainQuery}.</Trans>
          </styledEl.EmptyState>
        )}
      </styledEl.PanelList>
    </styledEl.Panel>
  )
}

interface ChainPanelHeaderProps {
  title: string
  variant: 'default' | 'fullscreen'
  onClose?: () => void
}

function ChainPanelHeader({ title, variant, onClose }: ChainPanelHeaderProps): ReactNode {
  const isFullscreen = variant === 'fullscreen'

  return (
    <styledEl.PanelHeader $isFullscreen={isFullscreen}>
      {isFullscreen && onClose ? <BackButton onClick={onClose} /> : null}
      <styledEl.PanelTitle $isFullscreen={isFullscreen}>{title}</styledEl.PanelTitle>
      {isFullscreen && onClose ? <span /> : null}
    </styledEl.PanelHeader>
  )
}

function filterChainsByQuery(chains: ChainInfo[], normalizedChainQuery: string): ChainInfo[] {
  if (!chains.length || !normalizedChainQuery) {
    return chains
  }

  return chains.filter((chain) => {
    const labelMatch = chain.label.toLowerCase().includes(normalizedChainQuery)
    const idMatch = String(chain.id).includes(normalizedChainQuery)

    return labelMatch || idMatch
  })
}

function getEmptyStateFlags({
  filteredChainsLength,
  isLoading,
  normalizedChainQuery,
  totalChains,
}: {
  filteredChainsLength: number
  isLoading: boolean
  normalizedChainQuery: string
  totalChains: number
}): { showSearchEmptyState: boolean; showUnavailableState: boolean } {
  const hasQuery = Boolean(normalizedChainQuery)

  return {
    showUnavailableState: !isLoading && totalChains === 0 && !hasQuery,
    showSearchEmptyState: !isLoading && filteredChainsLength === 0 && hasQuery,
  }
}
