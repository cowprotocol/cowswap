import { ChevronDown, ChevronUp } from 'react-feather'
import styled from 'styled-components/macro'
import { useCallback, useMemo, useState } from 'react'
import { Separator } from 'theme'
import { Props } from '.'
import { ETH_FLOW_SLIPPAGE } from 'state/ethFlow/updater'
import { PERCENTAGE_PRECISION } from 'constants/index'
import ethFlowIcon from 'assets/svg/ethFlow.svg'
import { useWeb3React } from '@web3-react/core'
import { useCurrencyBalances } from 'state/connection/hooks'

const BannerWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg7};
  border: 1px solid ghostwhite;
  border-radius: ${({ theme }) => theme.buttonOutlined.borderRadius};
  padding: 10px 14px;
  margin: 12px 0 8px;
  font-size: 13px;
`

const ClosedBannerWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(3, auto);
  align-items: center;
  justify-content: stretch;

  > strong {
    font-weight: 600;
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

type BannerProps = Pick<Props, 'native' | 'wrapped' | 'isNativeIn' | 'nativeInput'> & {
  wrapCallback: (forceWrap?: boolean) => void
  forceWrapCallback: (force: boolean) => void
  switchToWrappedCurrencyCallback: (() => void) | undefined
}

export default function Banner({
  native,
  wrapped,
  isNativeIn,
  nativeInput,
  wrapCallback,
  switchToWrappedCurrencyCallback,
}: BannerProps) {
  const { account } = useWeb3React()
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account ?? undefined, [native, wrapped])

  const [open, setOpen] = useState(false)
  const hasEnoughWrappedBalance = useMemo(() => {
    if (!wrappedBalance || wrappedBalance.equalTo('0')) return false
    if (!nativeInput || !nativeBalance || nativeBalance.equalTo('0')) return true

    return wrappedBalance.greaterThan(nativeInput)
  }, [nativeInput, nativeBalance, wrappedBalance])

  const handleForceWrap = useCallback(
    (e) => {
      e.stopPropagation()
      wrapCallback(true)
    },
    [wrapCallback]
  )

  if (!isNativeIn) return null

  return (
    <BannerWrapper>
      <ClosedBannerWrapper>
        <img alt="eth-flow-icon" src={ethFlowIcon} />
        <strong>
          {hasEnoughWrappedBalance
            ? `Switch to the classic ${wrapped.symbol} experience and benefit!`
            : `Wrap your ${native.symbol} and use the classic ${wrapped.symbol} experience!`}
        </strong>
        {open ? (
          <ChevronUp size={20} onClick={() => setOpen(false)} />
        ) : (
          <ChevronDown size={20} onClick={() => setOpen(true)} />
        )}
      </ClosedBannerWrapper>
      {open && (
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
                <SpanCta onClick={switchToWrappedCurrencyCallback}>
                  Switch to {wrapped.symbol}{' '}
                  <small>
                    or{' '}
                    <u>
                      {' '}
                      <SpanCta onClick={handleForceWrap}>wrap my {native.symbol} anyway</SpanCta>
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
