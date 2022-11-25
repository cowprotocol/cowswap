import { formatSmart, formatSmartAmount } from 'utils/format'
import React, { useMemo, useState } from 'react'
import { ActiveRateDisplay } from '@cow/modules/limitOrders/hooks/useActiveRateDisplay'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { RefreshCw } from 'react-feather'

export interface RateInfoProps {
  className?: string
  activeRateDisplay: ActiveRateDisplay
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  font-size: 14px;
`

const InvertIcon = styled.div`
  background: ${({ theme }) => theme.grey1};
  color: ${({ theme }) => theme.text1};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-block;
  text-align: center;
  line-height: 22px;
  margin-left: 5px;
  cursor: pointer;
  transition: background 0.15s ease-in-out, color 0.15s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.text1};
    color: ${({ theme }) => theme.grey1};
  }
`

export function RateInfo({ activeRateDisplay, className }: RateInfoProps) {
  const { inputCurrency, outputCurrency, activeRate, activeRateFiatAmount, inversedActiveRateFiatAmount } =
    activeRateDisplay

  const [isInversed, setIsInversed] = useState(false)

  const currentActiveRate = useMemo(() => {
    if (!activeRate) return null
    return isInversed ? activeRate.invert() : activeRate
  }, [isInversed, activeRate])

  const fiatAmount = useMemo(() => {
    return isInversed ? inversedActiveRateFiatAmount : activeRateFiatAmount
  }, [isInversed, activeRateFiatAmount, inversedActiveRateFiatAmount])

  const rateInputCurrency = useMemo(() => {
    return isInversed ? outputCurrency : inputCurrency
  }, [isInversed, inputCurrency, outputCurrency])

  const rateOutputCurrency = useMemo(() => {
    return isInversed ? inputCurrency : outputCurrency
  }, [isInversed, inputCurrency, outputCurrency])

  if (!rateInputCurrency || !rateOutputCurrency || !currentActiveRate) return null

  return (
    <Wrapper className={className}>
      <div>
        <Trans>Limit price</Trans>
        <InvertIcon onClick={() => setIsInversed(!isInversed)}>
          <RefreshCw size={12} />
        </InvertIcon>
      </div>
      <div>
        <span title={currentActiveRate.toSignificant(18) + ' ' + rateInputCurrency.symbol}>
          1 {rateInputCurrency.symbol} = {formatSmart(currentActiveRate)} {rateOutputCurrency.symbol}
        </span>{' '}
        {!!fiatAmount && <span>(≈${formatSmartAmount(fiatAmount)})</span>}
      </div>
    </Wrapper>
  )
}
