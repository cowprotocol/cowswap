import { ReactNode, useRef } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { Tooltip } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'

import * as styledEl from './mobileChainSelector.styled'

import { getChainAccent } from '../ChainsSelector/getChainAccent'

export interface ChainChipProps {
  chain: ChainInfo
  isActive: boolean
  onSelectChain(chain: ChainInfo): void
  isDisabled: boolean
  isLoading: boolean
  isWalletUnsupported?: boolean
  isTooltipVisible: boolean
  onDisabledClick(chainId: number): void
  onHideTooltip(): void
  clickEvent?: string
}

export function ChainChip({
  chain,
  isActive,
  onSelectChain,
  isDisabled,
  isLoading,
  isWalletUnsupported,
  isTooltipVisible,
  onDisabledClick,
  onHideTooltip,
  clickEvent,
}: ChainChipProps): ReactNode {
  const { t } = useLingui()
  const { darkMode } = useTheme()
  const accent = getChainAccent(chain.id)
  const logoSrc = darkMode ? chain.logo.dark : chain.logo.light
  const walletUnsupportedTooltip = t`This chain is not supported by your connected wallet (Coinbase Smart Wallet)`
  const disabledTooltip = isWalletUnsupported
    ? walletUnsupportedTooltip
    : t`This destination is not supported for this source chain`
  const loadingTooltip = t`Checking route availability...`
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
      data-click-event={clickEvent}
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
