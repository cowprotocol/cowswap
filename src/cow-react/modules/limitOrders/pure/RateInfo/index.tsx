import { formatSmart, formatSmartAmount } from 'utils/format'
import React, { useEffect, useMemo, useState } from 'react'
import { ActiveRateDisplay } from '@cow/modules/limitOrders/hooks/useActiveRateDisplay'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { RefreshCw } from 'react-feather'

export interface RateInfoProps {
  className?: string
  noLabel?: boolean
  isInversed?: boolean
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
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.white};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-block;
  text-align: center;
  line-height: 22px;
  margin-left: 5px;
  cursor: pointer;
`

export function InvertRateControl({ onClick }: { onClick(): void }) {
  return (
    <InvertIcon onClick={onClick}>
      <RefreshCw size={12} />
    </InvertIcon>
  )
}

export function RateInfo({ activeRateDisplay, className, isInversed = false, noLabel = false }: RateInfoProps) {
  const { inputCurrency, outputCurrency, activeRate, activeRateFiatAmount, inversedActiveRateFiatAmount } =
    activeRateDisplay

  const [currentIsInversed, setIsInversed] = useState(isInversed)

  const currentActiveRate = useMemo(() => {
    if (!activeRate) return null
    return currentIsInversed ? activeRate.invert() : activeRate
  }, [currentIsInversed, activeRate])

  const fiatAmount = useMemo(() => {
    return currentIsInversed ? inversedActiveRateFiatAmount : activeRateFiatAmount
  }, [currentIsInversed, activeRateFiatAmount, inversedActiveRateFiatAmount])

  const rateInputCurrency = useMemo(() => {
    return currentIsInversed ? outputCurrency : inputCurrency
  }, [currentIsInversed, inputCurrency, outputCurrency])

  const rateOutputCurrency = useMemo(() => {
    return currentIsInversed ? inputCurrency : outputCurrency
  }, [currentIsInversed, inputCurrency, outputCurrency])

  useEffect(() => {
    setIsInversed(isInversed)
  }, [isInversed])

  if (!rateInputCurrency || !rateOutputCurrency || !currentActiveRate) return null

  return (
    <Wrapper className={className}>
      {!noLabel && (
        <div>
          <Trans>Limit price</Trans>
          <InvertRateControl onClick={() => setIsInversed(!currentIsInversed)} />
        </div>
      )}
      <div>
        <span title={currentActiveRate.toSignificant(18) + ' ' + rateInputCurrency.symbol}>
          1 {rateInputCurrency.symbol} = {formatSmart(currentActiveRate)} {rateOutputCurrency.symbol}
        </span>{' '}
        {!!fiatAmount && <span>(≈${formatSmartAmount(fiatAmount)})</span>}
      </div>
    </Wrapper>
  )
}
