import React from 'react'
import { CurrencyAmount, Currency } from '@uniswap/sdk'
import styled from 'styled-components'
import CurrencyLogo from 'components/CurrencyLogo'
import { DEFAULT_PRECISION } from 'constants/index'

const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: center;
  margin: 8px 0;
  width: 100%;

  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};

  background: ${({ background = 'initial' }) => background};

  > span {
    &:first-child {
      margin-right: 3.2px;
    }
  }
`

const WrapCardWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 8px;
`

export const WrapCardContainer = styled.div`
  position: relative;
  ${({ theme }) => theme.flexRowNoWrap}
  border: 2.4px solid ${({ theme }) => theme.bg1};
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  margin: 11.2px 0;
  width: 100%;

  > ${WrapCardWrapper} {
    &:nth-of-type(even) {
      background-color: ${({ theme }) => theme.bg1};
    }

    > ${BalanceLabel}:last-child {
      margin: 0;
    }
  }

  // arrow
  > svg {
    position: absolute;
    left: calc(50% - 15px);
    top: calc(50% - 15px);
    border-radius: 100%;
    background: ${({ theme }) => theme.white};
    width: 30px;
    height: 30px;
    padding: 5px;
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
      <BalanceLabel>
        <span>Balance: </span>
        <span>{balance?.toSignificant(DEFAULT_PRECISION) || '-'}</span>
      </BalanceLabel>
    </WrapCardWrapper>
  )
}
