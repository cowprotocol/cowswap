import { ReactNode, useEffect, useMemo, useRef } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { Trans, useLingui } from '@lingui/react/macro'
import { ChevronDown } from 'react-feather'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

import { ChainChip } from './ChainChip'
import * as styledEl from './mobileChainSelector.styled'
import { useDisabledChainTooltip } from './useDisabledChainTooltip'

import { ChainsToSelectState } from '../../types'
import { sortChainsByDisplayOrder } from '../../utils/sortChainsByDisplayOrder'
import { makeBuildClickEvent } from '../ChainsSelector/analytics'

const DISABLED_CHAIN_TOOLTIP_DURATION_MS = 2500

interface MobileChainSelectorProps {
  chainsState: ChainsToSelectState
  label?: string
  onSelectChain(chain: ChainInfo): void
  onOpenPanel(): void
  tradeType?: TradeType
  field?: Field
  counterChainId?: ChainInfo['id']
}

interface ChainChipListProps {
  chainsState: ChainsToSelectState
  orderedChains: ChainInfo[]
  onSelectChain(chain: ChainInfo): void
  activeTooltipChainId: number | null
  onDisabledClick(chainId: number): void
  onHideTooltip(): void
  buildClickEvent?: (chain: ChainInfo) => string
  isSwapMode: boolean
}

function ChainChipList({
  chainsState,
  orderedChains,
  onSelectChain,
  activeTooltipChainId,
  onDisabledClick,
  onHideTooltip,
  buildClickEvent,
  isSwapMode,
}: ChainChipListProps): ReactNode {
  return (
    <>
      {orderedChains.map((chain) => {
        const isDisabled = chainsState.disabledChainIds?.has(chain.id) ?? false
        const isLoading = chainsState.loadingChainIds?.has(chain.id) ?? false
        const clickEvent =
          isSwapMode && buildClickEvent && !isDisabled && !isLoading ? buildClickEvent(chain) : undefined

        return (
          <ChainChip
            key={chain.id}
            chain={chain}
            isActive={chainsState.defaultChainId === chain.id}
            onSelectChain={onSelectChain}
            isDisabled={isDisabled}
            isLoading={isLoading}
            isTooltipVisible={activeTooltipChainId === chain.id}
            onDisabledClick={onDisabledClick}
            onHideTooltip={onHideTooltip}
            clickEvent={clickEvent}
          />
        )
      })}
    </>
  )
}

interface ChainSelectorLabelProps {
  label?: string
  activeChainLabel?: string
}

function ChainSelectorLabel({ label, activeChainLabel }: ChainSelectorLabelProps): ReactNode {
  const { t } = useLingui()

  if (!label) {
    return null
  }

  return (
    <styledEl.MobileSelectorLabel>
      <span>{label}</span>
      {activeChainLabel ? (
        <styledEl.ActiveChainLabel aria-label={t`Selected network ${activeChainLabel}`}>
          {activeChainLabel}
        </styledEl.ActiveChainLabel>
      ) : null}
    </styledEl.MobileSelectorLabel>
  )
}

interface MoreNetworksButtonProps {
  totalChains: number
  onOpenPanel(): void
}

function MoreNetworksButton({ totalChains, onOpenPanel }: MoreNetworksButtonProps): ReactNode {
  const { t } = useLingui()

  if (totalChains <= 0) {
    return null
  }

  return (
    <styledEl.FixedAllNetworks>
      <styledEl.MoreChipButton onClick={onOpenPanel} aria-label={t`View all ${totalChains} networks`}>
        <span>
          <Trans>View all ({totalChains})</Trans>
        </span>
        <ChevronDown size={14} />
      </styledEl.MoreChipButton>
    </styledEl.FixedAllNetworks>
  )
}

export function MobileChainSelector({
  chainsState,
  label,
  onSelectChain,
  onOpenPanel,
  tradeType,
  field,
  counterChainId,
}: MobileChainSelectorProps): ReactNode {
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
  const contextLabel = field === Field.INPUT ? 'sell' : field === Field.OUTPUT ? 'buy' : undefined
  const buildClickEvent = useMemo(
    () =>
      tradeType && contextLabel
        ? makeBuildClickEvent(chainsState.defaultChainId, contextLabel, tradeType, counterChainId)
        : undefined,
    [chainsState.defaultChainId, contextLabel, tradeType, counterChainId],
  )
  const isSwapMode = tradeType === TradeType.SWAP

  useEffect(() => {
    if (!scrollRef.current) {
      return
    }

    scrollRef.current.scrollTo({ left: 0, behavior: 'auto' })
  }, [chainsState.defaultChainId])

  return (
    <styledEl.MobileSelectorRow>
      <ChainSelectorLabel label={label} activeChainLabel={activeChainLabel} />
      <styledEl.ScrollContainer>
        {canRenderChains ? (
          <styledEl.ScrollArea ref={scrollRef}>
            <ChainChipList
              chainsState={chainsState}
              orderedChains={orderedChains}
              onSelectChain={onSelectChain}
              activeTooltipChainId={activeTooltipChainId}
              onDisabledClick={toggleTooltip}
              onHideTooltip={hideTooltip}
              buildClickEvent={buildClickEvent}
              isSwapMode={isSwapMode}
            />
          </styledEl.ScrollArea>
        ) : null}
        <MoreNetworksButton totalChains={totalChains} onOpenPanel={onOpenPanel} />
      </styledEl.ScrollContainer>
    </styledEl.MobileSelectorRow>
  )
}
