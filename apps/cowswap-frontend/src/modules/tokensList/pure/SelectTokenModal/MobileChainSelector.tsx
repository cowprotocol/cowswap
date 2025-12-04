import { ReactNode, useEffect, useMemo, useRef } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { ChevronDown } from 'react-feather'

import * as styledEl from './mobileChainSelector.styled'

import { ChainsToSelectState } from '../../types'
import { sortChainsByDisplayOrder } from '../../utils/sortChainsByDisplayOrder'
import { getChainAccent } from '../ChainsSelector'

interface MobileChainSelectorProps {
  chainsState: ChainsToSelectState
  label?: string
  onSelectChain(chain: ChainInfo): void
  onOpenPanel(): void
}

export function MobileChainSelector({
  chainsState,
  label,
  onSelectChain,
  onOpenPanel,
}: MobileChainSelectorProps): ReactNode {
  const { i18n } = useLingui()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const orderedChains = useMemo(
    () =>
      sortChainsByDisplayOrder(chainsState.chains ?? [], {
        pinChainId: chainsState.defaultChainId,
      }),
    [chainsState.chains, chainsState.defaultChainId],
  )

  const totalChains = chainsState.chains?.length ?? 0
  const canRenderChains = orderedChains.length > 0
  const activeChainLabel = orderedChains.find((chain) => chain.id === chainsState.defaultChainId)?.label

  useEffect(() => {
    if (!scrollRef.current) {
      return
    }

    scrollRef.current.scrollTo({ left: 0, behavior: 'auto' })
  }, [chainsState.defaultChainId])

  return (
    <styledEl.MobileSelectorRow>
      {label ? (
        <styledEl.MobileSelectorLabel>
          <span>{label}</span>
          {activeChainLabel ? (
            <styledEl.ActiveChainLabel aria-label={i18n._(msg`Selected network ${activeChainLabel}`)}>
              {activeChainLabel}
            </styledEl.ActiveChainLabel>
          ) : null}
        </styledEl.MobileSelectorLabel>
      ) : null}
      <styledEl.ScrollContainer>
        {canRenderChains ? (
          <styledEl.ScrollArea ref={scrollRef}>
            {orderedChains.map((chain) => (
              <ChainChip
                key={chain.id}
                chain={chain}
                isActive={chainsState.defaultChainId === chain.id}
                onSelectChain={onSelectChain}
              />
            ))}
          </styledEl.ScrollArea>
        ) : null}
        {totalChains > 0 ? (
          <styledEl.FixedAllNetworks>
            <styledEl.MoreChipButton onClick={onOpenPanel} aria-label={i18n._(msg`View all ${totalChains} networks`)}>
              <span>
                <Trans>View all ({totalChains})</Trans>
              </span>
              <ChevronDown size={14} />
            </styledEl.MoreChipButton>
          </styledEl.FixedAllNetworks>
        ) : null}
      </styledEl.ScrollContainer>
    </styledEl.MobileSelectorRow>
  )
}

interface ChainChipProps {
  chain: ChainInfo
  isActive: boolean
  onSelectChain(chain: ChainInfo): void
}

function ChainChip({ chain, isActive, onSelectChain }: ChainChipProps): ReactNode {
  const { darkMode } = useTheme()
  const accent = getChainAccent(chain.id)
  const logoSrc = darkMode ? chain.logo.dark : chain.logo.light

  return (
    <styledEl.ChainChipButton
      type="button"
      onClick={() => onSelectChain(chain)}
      $active={isActive}
      $accent={accent}
      aria-pressed={isActive}
    >
      <img src={logoSrc} alt={chain.label} loading="lazy" />
    </styledEl.ChainChipButton>
  )
}
