import { ReactNode, useEffect, useMemo, useRef } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { Trans, useLingui } from '@lingui/react/macro'
import { ChevronDown } from 'react-feather'

import { ChainChip } from './ChainChip'
import * as styledEl from './mobileChainSelector.styled'
import { useDisabledChainTooltip } from './useDisabledChainTooltip'

import { ChainsToSelectState } from '../../types'
import { sortChainsByDisplayOrder } from '../../utils/sortChainsByDisplayOrder'

const DISABLED_CHAIN_TOOLTIP_DURATION_MS = 2500

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
  const { t } = useLingui()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { activeTooltipChainId, toggleTooltip, hideTooltip } = useDisabledChainTooltip(
    DISABLED_CHAIN_TOOLTIP_DURATION_MS,
  )
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
            <styledEl.ActiveChainLabel aria-label={t`Selected network ${activeChainLabel}`}>
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
                isDisabled={chainsState.disabledChainIds?.has(chain.id) ?? false}
                isLoading={chainsState.loadingChainIds?.has(chain.id) ?? false}
                disabledReason={chainsState.disabledReasons?.get(chain.id)}
                isTooltipVisible={activeTooltipChainId === chain.id}
                onDisabledClick={toggleTooltip}
                onHideTooltip={hideTooltip}
              />
            ))}
          </styledEl.ScrollArea>
        ) : null}
        {totalChains > 0 ? (
          <styledEl.FixedAllNetworks>
            <styledEl.MoreChipButton onClick={onOpenPanel} aria-label={t`View all ${totalChains} networks`}>
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
