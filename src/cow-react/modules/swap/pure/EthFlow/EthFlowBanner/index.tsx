import { Trans } from '@lingui/macro'
import { Separator } from 'theme'
import { ChevronUp, ChevronDown } from 'react-feather'
import { Currency, Token } from '@uniswap/sdk-core'

import { ETH_FLOW_SLIPPAGE } from '@cow/modules/swap/state/EthFlow/updaters/EthFlowSlippageUpdater'
import { PERCENTAGE_PRECISION } from 'constants/index'
import { EthFlowBannerCallbacks } from '@cow/modules/swap/containers/EthFlow/EthFlowBanner'
import ethFlowIcon from 'assets/svg/ethFlow.svg'
import * as styledEl from './styleds'

export interface EthFlowBannerContentProps extends EthFlowBannerCallbacks {
  native: Currency
  wrapped: Token & { logoURI: string }
  showBanner: boolean
  hasEnoughWrappedBalance: boolean
  showBannerCallback: () => void
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
    <styledEl.BannerWrapper onClick={showBannerCallback}>
      <styledEl.ClosedBannerWrapper>
        <img alt="eth-flow-icon" src={ethFlowIcon} />
        <strong>
          <Trans>
            {hasEnoughWrappedBalance
              ? `Switch to the classic ${wrapped.symbol} experience and benefit!`
              : `Wrap your ${native.symbol} and use the classic ${wrapped.symbol} experience!`}
          </Trans>
        </strong>
        {showBanner ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </styledEl.ClosedBannerWrapper>
      {showBanner && (
        <styledEl.BannerInnerWrapper>
          <Trans>
            <p>
              {!hasEnoughWrappedBalance ? (
                <>
                  You will be prompted to{' '}
                  <strong>
                    wrap your {native.symbol} to {wrapped.symbol}
                  </strong>{' '}
                  before placing your order.
                </>
              ) : null}{' '}
              This way, you&apos;ll take of advantage of:
            </p>
            <ul>
              <li>Lower overall fees</li>
              <li>Lower default slippage (instead of {ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)}%)</li>
              <li>No fees for failed transactions</li>
            </ul>
            <Separator />
            <styledEl.WrapEthCta>
              {hasEnoughWrappedBalance ? (
                <>
                  <styledEl.SpanCta onClick={switchCurrencyCallback}>Switch to {wrapped.symbol} </styledEl.SpanCta>
                </>
              ) : (
                <styledEl.SpanCta onClick={wrapCallback}>Wrap my {native.symbol} and swap</styledEl.SpanCta>
              )}
            </styledEl.WrapEthCta>
          </Trans>
        </styledEl.BannerInnerWrapper>
      )}
    </styledEl.BannerWrapper>
  )
}
