import savingsIcon from '@cowprotocol/assets/cow-swap/savings.svg'
import { MINIMUM_ETH_FLOW_SLIPPAGE, PERCENTAGE_PRECISION } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'
import { Currency, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { ChevronDown, ChevronUp } from 'react-feather'
import SVG from 'react-inlinesvg'

import { EthFlowBannerCallbacks } from 'modules/swap/containers/EthFlow/EthFlowBanner'

import * as styledEl from './styleds'
export interface EthFlowBannerContentProps extends EthFlowBannerCallbacks {
  native: Currency
  wrapped: Token
  showBanner: boolean
  hasEnoughWrappedBalance: boolean
  showBannerCallback: Command
}

export function EthFlowBannerContent(props: EthFlowBannerContentProps) {
  const {
    native,
    wrapped,
    showBanner,
    hasEnoughWrappedBalance,
    showBannerCallback,
    switchCurrencyCallback,
    wrapCallback,
  } = props
  return (
    <styledEl.BannerWrapper onClick={showBannerCallback} id="classic-eth-flow-banner">
      <styledEl.ClosedBannerWrapper>
        <SVG title="Switch to WETH" src={savingsIcon} />
        <b>
          <Trans>
            {hasEnoughWrappedBalance
              ? `Switch to the classic ${wrapped.symbol} experience and benefit!`
              : `Wrap your ${native.symbol} and use the classic ${wrapped.symbol} experience!`}
          </Trans>
        </b>
        {showBanner ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </styledEl.ClosedBannerWrapper>
      {showBanner && (
        <styledEl.BannerInnerWrapper>
          <Trans>
            <p>
              {!hasEnoughWrappedBalance ? (
                <>
                  You will be prompted to{' '}
                  <b>
                    wrap your {native.symbol} to {wrapped.symbol}
                  </b>{' '}
                  before placing your order.
                </>
              ) : null}{' '}
              This way, you&apos;ll take advantage of:
            </p>
            <ul>
              <li>Lower overall network costs</li>
              <li>
                Lower default slippage (instead of {MINIMUM_ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)}%
                minimum)
              </li>
              <li>No fees for failed transactions</li>
            </ul>

            {hasEnoughWrappedBalance ? (
              <ButtonPrimary id="switch-to-wrapped" onClick={switchCurrencyCallback}>
                Switch to {wrapped.symbol}{' '}
              </ButtonPrimary>
            ) : (
              <ButtonPrimary id="wrap-native" onClick={wrapCallback}>
                Wrap my {native.symbol} and swap
              </ButtonPrimary>
            )}
          </Trans>
        </styledEl.BannerInnerWrapper>
      )}
    </styledEl.BannerWrapper>
  )
}
