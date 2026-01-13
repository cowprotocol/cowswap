import { ReactNode, useMemo, useState } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ChainPanelHeader } from './ChainPanelHeader'
import { filterChainsByQuery, getEmptyStateFlags } from './chainPanelUtils'
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
          disabledChainIds={chainsState?.disabledChainIds}
          loadingChainIds={chainsState?.loadingChainIds}
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
