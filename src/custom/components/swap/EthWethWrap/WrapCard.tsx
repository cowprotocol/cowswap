import React from 'react'
import { CurrencyAmount, Currency } from '@uniswap/sdk'
import styled from 'styled-components'
import CurrencyLogo from 'components/CurrencyLogo'
import { DEFAULT_PRECISION } from 'constants/index'

const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: center;
  margin: 0 0 4px;
  font-size: 13px;
  width: 100%;
`

const WrapCardWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 8px;
  border-radius: 0 6px 6px 0;

  > img {
    width: 32px;
    height: 32px;
    margin: 0 0 14px;
    box-shadow: none;
  }
`

export const WrapCardContainer = styled.div`
  position: relative;
  ${({ theme }) => theme.flexRowNoWrap}
  border: 2px solid ${({ theme }) => theme.bg1};
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  margin: 12px 0;
  width: 100%;
  min-height: 140px;

  > ${WrapCardWrapper} {
    &:nth-of-type(1) {
      background-color: transparent;
      color: ${({ theme }) => theme.wallet.color};
    }

    &:nth-of-type(2) {
      background-color: ${({ theme }) => theme.bg1};
    }

    > ${BalanceLabel}:last-of-type{
      margin: 0;
      font-size: 12px;
    }
  }

  // arrow
  > svg {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    background: ${({ theme }) => theme.white};
    width: 24px;
    height: 24px;
    border-radius: 24px;
    padding: 3px;
  }
`

interface WrapCardProps {
  symbol: string
  balance?: CurrencyAmount
  amountToWrap?: CurrencyAmount
  currency: Currency
}

export function WrapCard(props: WrapCardProps) {
  const { symbol, balance, amountToWrap, currency } = props
  return (
    <WrapCardWrapper>
      {/* logo */}
      <CurrencyLogo currency={currency} size="24px" />
      {/* amount to wrap/unwrap */}
      <BalanceLabel>
        <strong>
          {amountToWrap?.toSignificant(DEFAULT_PRECISION) || '-'} {symbol}
        </strong>
      </BalanceLabel>
      {/* user balance */}
      <BalanceLabel>Balance: {balance?.toSignificant(DEFAULT_PRECISION) || '-'}</BalanceLabel>
    </WrapCardWrapper>
  )
}
