import { ReactNode } from 'react'

import OrderCheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import { useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { getChainAccent } from './getChainAccent'
import * as styledEl from './styled'

export interface ChainButtonProps {
  chain: ChainInfo
  isActive: boolean
  isDarkMode: boolean
  onSelectChain(chain: ChainInfo): void
  isDisabled: boolean
  isLoading: boolean
  isWalletUnsupported?: boolean
  clickEvent?: string
}

export function ChainButton({
  chain,
  isActive,
  isDarkMode,
  onSelectChain,
  isDisabled,
  isLoading,
  isWalletUnsupported,
  clickEvent,
}: ChainButtonProps): ReactNode {
  const { t } = useLingui()
  const logoSrc = isDarkMode ? chain.logo.dark : chain.logo.light
  const accent = getChainAccent(chain.id)
  const walletUnsupportedTooltip = t`This chain is not supported by your connected wallet (Coinbase Smart Wallet)`
  const disabledTooltip = isWalletUnsupported
    ? walletUnsupportedTooltip
    : t`This destination is not supported for this source chain`
  const loadingTooltip = t`Checking route availability...`

  const handleClick = (): void => {
    if (!isDisabled && !isLoading) {
      onSelectChain(chain)
    }
  }

  const tooltip = isLoading ? loadingTooltip : isDisabled ? disabledTooltip : undefined

  return (
    <styledEl.ChainButton
      onClick={handleClick}
      active$={isActive}
      accent$={accent}
      aria-pressed={isActive}
      aria-disabled={isDisabled || isLoading}
      disabled$={isDisabled}
      loading$={isLoading}
      title={tooltip}
      data-click-event={clickEvent}
    >
      <styledEl.ChainInfo>
        <styledEl.ChainLogo>
          <img src={logoSrc} alt={chain.label} loading="lazy" />
        </styledEl.ChainLogo>
        <styledEl.ChainText disabled$={isDisabled} loading$={isLoading}>
          {chain.label}
        </styledEl.ChainText>
      </styledEl.ChainInfo>
      {isActive && !isLoading && (
        <styledEl.ActiveIcon aria-hidden accent$={accent} color$={chain.color}>
          <SVG src={OrderCheckIcon} />
        </styledEl.ActiveIcon>
      )}
    </styledEl.ChainButton>
  )
}
