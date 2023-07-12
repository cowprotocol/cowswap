import React, { useCallback } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { transparentize } from 'polished'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import CheckSingular from 'legacy/assets/cow-swap/check-singular.svg'
import SurplusCow from 'legacy/assets/cow-swap/surplus-cow.svg'
import twitterImage from 'legacy/assets/cow-swap/twitter.svg'
import { sendEvent } from 'legacy/components/analytics'
import { Order } from 'legacy/state/orders/actions'
import { ExternalLink } from 'legacy/theme'

import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount, SymbolElement } from 'common/pure/TokenAmount'

const SELL_SURPLUS_WORD = 'got'
const BUY_SURPLUS_WORD = 'saved'

export const Wrapper = styled.div`
  --borderRadius: 16px;
  display: flex;
  flex-flow: column wrap;
  align-items: space-between;
  justify-content: flex-start;
  border-radius: var(--borderRadius);
  position: relative;
  width: 100%;

  &::before {
    content: '';
    position: absolute;
    left: -16px;
    top: -60px;
    width: calc(100% + 32px);
    height: 170px;
    background: ${({ theme }) => transparentize(0.9, theme.success)};
    z-index: -1;
  }

  > h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    width: 100%;
    font-weight: 600;
    line-height: 1;
    text-align: center;
    position: absolute;
    top: -54px;
    color: ${({ theme }) => theme.success};

    > svg {
      --size: 28px;
      width: var(--size);
      height: var(--size);
      background: ${({ theme }) => theme.bg1};
      border-radius: 50%;
      width: var(--size);
      height: var(--size);
      object-fit: contain;
      margin: 0 10px 0 0;
      padding: 6px;

      > path {
        fill: ${({ theme }) => theme.success};
      }
    }
  }

  ${SymbolElement} {
    word-break: break-word;
  }

  > span {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }

  > span > img {
    --size: 190px;
    width: var(--size);
    height: var(--size);
    margin: 0 auto;
    object-fit: contain;
  }

  > h3 {
    font-size: 20px;
    line-height: 1.2;
    margin: 24px auto 4px;
    font-weight: 300;
  }

  > strong {
    font-size: 34px;
    width: 100%;
    display: block;
    padding: 0 24px;
    text-align: center;

    > span {
      word-break: break-all;
      white-space: pre-wrap;
      display: contents;
    }
  }

  > p {
    font-size: 14px;
    display: block;
    text-align: center;
    width: 70%;
    margin: 34px auto;
    padding: 0;
    color: ${({ theme }) => theme.text2};
  }
`

const StyledExternalLink = styled(ExternalLink)`
  border-radius: 24px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.white};
  display: flex;
  padding: 1rem 2rem;
  width: fit-content;
  margin: 1.6rem auto 0;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;

  &:hover {
    text-decoration: none;
    transform: scale(1.03);
  }
`

export type SurplusModalProps = {
  order: Order | undefined
}

export function SurplusModal(props: SurplusModalProps) {
  const { order } = props

  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount, showSurplus } = useGetSurplusData(order)

  const onTweetShare = useCallback(() => {
    sendEvent({
      category: 'Surplus Modal',
      action: 'Share on Twitter',
    })
  }, [])

  if (!order || !showSurplus) {
    return null
  }

  const surplusMsg = `You ${order.kind === OrderKind.SELL ? SELL_SURPLUS_WORD : BUY_SURPLUS_WORD} an extra`

  return (
    <Wrapper>
      <h2>
        <SVG src={CheckSingular} title="check" /> Swap completed
      </h2>
      <span>
        <img src={SurplusCow} alt="surplus cow" />
      </span>
      <h3>Great! {surplusMsg}</h3>
      <strong>
        <TokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />
        <span>!</span>
      </strong>
      {showFiatValue && <FiatAmount amount={surplusFiatValue} accurate={false} />}
      {surplusAmount && surplusToken && (
        <StyledExternalLink
          onClickOptional={onTweetShare}
          href={`https://twitter.com/intent/tweet?text=${getTwitterText(
            surplusAmount.toSignificant(),
            surplusToken.symbol || 'Unknown token',
            order.kind
          )}`}
        >
          <SVG src={twitterImage} description="Twitter" />
          <span>Share this win!</span>
        </StyledExternalLink>
      )}
      <p>
        CoW Swap is the only token exchange that gets you extra tokens.{' '}
        <ExternalLink href={'https://blog.cow.fi/announcing-cow-swap-surplus-notifications-f679c77702ea'}>
          Learn how ↗
        </ExternalLink>
      </p>
    </Wrapper>
  )
}

function getTwitterText(surplusAmount: string, surplusToken: string, orderKind: OrderKind) {
  const actionWord = orderKind === OrderKind.SELL ? SELL_SURPLUS_WORD : BUY_SURPLUS_WORD
  const surplus = `${surplusAmount} ${surplusToken}`
  return encodeURIComponent(
    `Hey, I just ${actionWord} an extra ${surplus} on @CoWSwap! 🐮💸\n\nStart swapping on swap.cow.fi`
  )
}
