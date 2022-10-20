import { Separator } from 'theme'
import styled from 'styled-components/macro'
import { ChevronUp, ChevronDown } from 'react-feather'
import { Currency, Token } from '@uniswap/sdk-core'

import { ETH_FLOW_SLIPPAGE } from '@cow/modules/swap/state/EthFlow/updater'
import { PERCENTAGE_PRECISION } from 'constants/index'
import { EthFlowBannerCallbacks } from '@cow/modules/swap/containers/EthFlow/EthFlowBanner'
import ethFlowIcon from 'assets/svg/ethFlow.svg'
import { darken } from 'polished'

const BannerWrapper = styled.div`
  background-color: ${({ theme }) => darken(theme.darkMode ? 0 : 0.08, theme.bg7)};
  border: ${({ theme }) => theme.cardBorder};
  border-radius: ${({ theme }) => theme.buttonOutlined.borderRadius};
  padding: 14px;
  margin: 12px 0 8px;
  font-size: 13px;
  cursor: pointer;
`

const ClosedBannerWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 0.7fr auto 0.7fr;
  align-items: center;
  > strong {
    font-weight: 600;
  }
  > img:first-child {
    filter: ${({ theme }) => `invert(${theme.darkMode ? 0 : 1})`};
  }
  > svg:last-child {
    cursor: pointer;
  }
  > svg,
  > strong {
    margin: auto;
  }
`

const BannerInnerWrapper = styled.div`
  display: grid;
  grid-template-rows: auto;
  align-items: center;
  justify-content: stretch;
  width: 100%;
  text-align: left;
  > p {
    padding: 0 10px;
    margin-bottom: 0;
  }
`

const WrapEthCta = styled(BannerInnerWrapper)`
  flex-flow: row nowrap;
  text-align: center;
  > span {
    cursor: pointer;
    font-weight: bold;
    margin: 12px 0 4px;
  }
`

const SpanCta = styled.span`
  > small {
    display: block;
    margin: 5px 0 0;
    font-weight: 400;
  }
`

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
    <BannerWrapper onClick={showBannerCallback}>
      <ClosedBannerWrapper>
        <img alt="eth-flow-icon" src={ethFlowIcon} />
        <strong>
          {hasEnoughWrappedBalance
            ? `Switch to the classic ${wrapped.symbol} experience and benefit!`
            : `Wrap your ${native.symbol} and use the classic ${wrapped.symbol} experience!`}
        </strong>
        {showBanner ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </ClosedBannerWrapper>
      {showBanner && (
        <BannerInnerWrapper>
          <p>
            {!hasEnoughWrappedBalance && (
              <>
                You will be prompted to{' '}
                <strong>
                  wrap your {native.symbol} to {wrapped.symbol}
                </strong>{' '}
                before placing your order.
              </>
            )}{' '}
            This way, you&apos;ll take of advantage of:
          </p>
          <ul>
            <li>Lower overall fees</li>
            <li>Lower default slippage (instead of {ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)}%)</li>
            <li>No fees for failed transactions</li>
          </ul>
          <Separator />
          <WrapEthCta>
            {hasEnoughWrappedBalance ? (
              <>
                <SpanCta onClick={switchCurrencyCallback}>
                  Switch to {wrapped.symbol}{' '}
                  <small>
                    or{' '}
                    <u>
                      {' '}
                      <SpanCta
                        onClick={(e) => {
                          e.stopPropagation()
                          wrapCallback(true)
                        }}
                      >
                        wrap my {native.symbol} and swap
                      </SpanCta>
                    </u>
                  </small>
                </SpanCta>
              </>
            ) : (
              <SpanCta onClick={() => wrapCallback()}>Wrap my {native.symbol} and swap</SpanCta>
            )}
          </WrapEthCta>
        </BannerInnerWrapper>
      )}
    </BannerWrapper>
  )
}
