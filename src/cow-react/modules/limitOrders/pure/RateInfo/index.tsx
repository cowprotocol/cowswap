import { formatSmart, formatSmartAmount } from 'utils/format'
import React from 'react'
import { ActiveRateDisplay } from '@cow/modules/limitOrders/hooks/useActiveRateDisplay'
import styled from 'styled-components/macro'

export interface RateInfoProps {
  className?: string
  activeRateDisplay: ActiveRateDisplay
}

const Wrapper = styled.div`
  font-size: 14px;
`

export function RateInfo({ activeRateDisplay, className }: RateInfoProps) {
  const { currentActiveRate, currentActiveRateFiatAmount, inputActiveRateCurrency, outputActiveRateCurrency } =
    activeRateDisplay

  if (!currentActiveRate || !inputActiveRateCurrency || !outputActiveRateCurrency) return null

  return (
    <Wrapper className={className}>
      <span title={currentActiveRate.toSignificant(18) + ' ' + inputActiveRateCurrency.symbol}>
        1 {inputActiveRateCurrency.symbol} = {formatSmart(currentActiveRate)} {outputActiveRateCurrency.symbol}
      </span>{' '}
      {!!currentActiveRateFiatAmount && <span>(≈${formatSmartAmount(currentActiveRateFiatAmount)})</span>}
    </Wrapper>
  )
}
