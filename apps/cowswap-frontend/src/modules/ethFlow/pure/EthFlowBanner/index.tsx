import { ReactNode } from 'react'

import { MINIMUM_ETH_FLOW_SLIPPAGE, PERCENTAGE_PRECISION } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { Currency, Token } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import savingsIcon from 'assets/cow-swap/savings.svg'
import { ChevronDown, ChevronUp } from 'react-feather'
import SVG from 'react-inlinesvg'

import * as styledEl from './styleds'

import { EthFlowBannerCallbacks } from '../../containers/EthFlow/EthFlowBanner'

export interface EthFlowBannerContentProps extends EthFlowBannerCallbacks {
  native: Currency
  wrapped: Token
  showBanner: boolean
  hasEnoughWrappedBalance: boolean
  showBannerCallback: Command
}

export function EthFlowBannerContent(props: EthFlowBannerContentProps): ReactNode {
  const {
    native,
    wrapped,
    showBanner,
    hasEnoughWrappedBalance,
    showBannerCallback,
    switchCurrencyCallback,
    wrapCallback,
  } = props
  const wrappedSymbol = wrapped?.symbol || ''
  const nativeSymbol = native?.symbol || ''
  const minEthFlowSlippageToSignificant = MINIMUM_ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)

  return (
    <styledEl.BannerWrapper onClick={showBannerCallback} id="classic-eth-flow-banner">
      <styledEl.ClosedBannerWrapper>
        <SVG title={t`Switch to WETH`} src={savingsIcon} />
        <b>
          {hasEnoughWrappedBalance
            ? t`Switch to the classic ${wrappedSymbol} experience and benefit!`
            : t`Wrap your ${nativeSymbol} and use the classic ${wrappedSymbol} experience!`}
        </b>
        {showBanner ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </styledEl.ClosedBannerWrapper>
      {showBanner && (
        <styledEl.BannerInnerWrapper>
          <p>
            {!hasEnoughWrappedBalance ? (
              <Trans>
                You will be prompted to{' '}
                <b>
                  wrap your {nativeSymbol} to {wrappedSymbol}
                </b>{' '}
                before placing your order.
              </Trans>
            ) : null}{' '}
            <Trans>This way, you&apos;ll take advantage of</Trans>:
          </p>
          <ul>
            <li>
              <Trans>Lower overall network costs</Trans>
            </li>
            <li>
              <Trans>Lower minimal slippage (instead of {minEthFlowSlippageToSignificant}% minimum)</Trans>
            </li>
            <li>
              <Trans>No fees for failed transactions</Trans>
            </li>
          </ul>

          {hasEnoughWrappedBalance ? (
            <ButtonPrimary id="switch-to-wrapped" onClick={switchCurrencyCallback}>
              <Trans>Switch to {wrappedSymbol}</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary id="wrap-native" onClick={wrapCallback}>
              <Trans>Wrap my {nativeSymbol} and swap</Trans>
            </ButtonPrimary>
          )}
        </styledEl.BannerInnerWrapper>
      )}
    </styledEl.BannerWrapper>
  )
}
