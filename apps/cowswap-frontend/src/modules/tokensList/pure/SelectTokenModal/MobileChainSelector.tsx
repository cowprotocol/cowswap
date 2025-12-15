import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { Tooltip } from '@cowprotocol/ui'

import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { ChevronDown } from 'react-feather'

import * as styledEl from './mobileChainSelector.styled'

import { ChainsToSelectState } from '../../types'
import { sortChainsByDisplayOrder } from '../../utils/sortChainsByDisplayOrder'
import { getChainAccent } from '../ChainsSelector'

const DISABLED_CHAIN_TOOLTIP_DURATION_MS = 2500

function useDisabledChainTooltip(durationMs: number): {
  activeTooltipChainId: number | null
  toggleTooltip(chainId: number): void
  hideTooltip(): void
} {
  const [activeTooltipChainId, setActiveTooltipChainId] = useState<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)

  const hideTooltip = useCallback((): void => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    setActiveTooltipChainId(null)
  }, [])

  const toggleTooltip = useCallback(
    (chainId: number): void => {
      setActiveTooltipChainId((prev) => {
        if (hideTimerRef.current) {
          window.clearTimeout(hideTimerRef.current)
          hideTimerRef.current = null
        }

        const next = prev === chainId ? null : chainId
        if (next !== null) {
          hideTimerRef.current = window.setTimeout(() => {
            setActiveTooltipChainId(null)
            hideTimerRef.current = null
          }, durationMs)
        }

        return next
      })
    },
    [durationMs],
  )

  useEffect(() => {
    return hideTooltip
  }, [hideTooltip])

  return { activeTooltipChainId, toggleTooltip, hideTooltip }
}

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
                isDisabled={chainsState.disabledChainIds?.has(chain.id) ?? false}
                isLoading={chainsState.loadingChainIds?.has(chain.id) ?? false}
                isTooltipVisible={activeTooltipChainId === chain.id}
                onDisabledClick={toggleTooltip}
                onHideTooltip={hideTooltip}
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
  isDisabled: boolean
  isLoading: boolean
  isTooltipVisible: boolean
  onDisabledClick(chainId: number): void
  onHideTooltip(): void
}

function ChainChip({
  chain,
  isActive,
  onSelectChain,
  isDisabled,
  isLoading,
  isTooltipVisible,
  onDisabledClick,
  onHideTooltip,
}: ChainChipProps): ReactNode {
  const { i18n } = useLingui()
  const { darkMode } = useTheme()
  const accent = getChainAccent(chain.id)
  const logoSrc = darkMode ? chain.logo.dark : chain.logo.light
  const disabledTooltip = i18n._(msg`This destination is not supported for this source chain`)
  const loadingTooltip = i18n._(msg`Checking route availability...`)
  const chipRef = useRef<HTMLButtonElement | null>(null)

  const handleClick = (): void => {
    if (isLoading) {
      return
    }

    if (!isDisabled) {
      onHideTooltip()
      onSelectChain(chain)
      return
    }

    onDisabledClick(chain.id)
  }

  const tooltip = isLoading ? loadingTooltip : disabledTooltip

  const chipButton = (
    <styledEl.ChainChipButton
      ref={chipRef}
      type="button"
      onClick={handleClick}
      $active={isActive}
      $accent={accent}
      $disabled={isDisabled}
      $loading={isLoading}
      aria-pressed={isActive}
      aria-disabled={isDisabled || isLoading}
      title={isDisabled || isLoading ? tooltip : undefined}
    >
      <img src={logoSrc} alt={chain.label} loading="lazy" />
    </styledEl.ChainChipButton>
  )

  return isDisabled ? (
    <Tooltip
      show={isTooltipVisible}
      wrapInContainer
      content={disabledTooltip}
      containerRef={chipRef}
      placement="bottom"
    >
      {chipButton}
    </Tooltip>
  ) : (
    chipButton
  )
}
