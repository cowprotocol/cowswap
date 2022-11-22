import { formatSmart, formatSmartAmount } from 'utils/format'
import React, { useEffect, useMemo, useState } from 'react'
import { ActiveRateDisplay } from '@cow/modules/limitOrders/hooks/useActiveRateDisplay'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { RefreshCw } from 'react-feather'
import { getAnchorCurrency } from '@cow/common/services/getAnchorCurrency'
import { getAddress } from '@cow/modules/limitOrders/utils/getAddress'

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
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  const {
    chainId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    activeRate,
    activeRateFiatAmount,
    inversedActiveRateFiatAmount,
  } = activeRateDisplay

  const inputCurrency = inputCurrencyAmount?.currency
  const outputCurrency = outputCurrencyAmount?.currency

  const [currentIsInversed, setCurrentIsInversed] = useState(isInversed)
  const [isAnchorCurrencyDetected, setIsAnchorCurrencyDetected] = useState(false)

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

  const anchorCurrency = useMemo(() => {
    return getAnchorCurrency(chainId, inputCurrencyAmount, outputCurrencyAmount)
  }, [chainId, inputCurrencyAmount, outputCurrencyAmount])

  useEffect(() => {
    setCurrentIsInversed((state) => !state)
  }, [isInversed])

  /**
   * @see getAnchorCurrency
   */
  useEffect(() => {
    setIsAnchorCurrencyDetected(!!anchorCurrency)

    if (isAnchorCurrencyDetected) return

    if (anchorCurrency) {
      const [anchorCurrencyAddress, inputCurrencyAddress] = [getAddress(anchorCurrency), getAddress(inputCurrency)]

      setIsInversed(anchorCurrencyAddress !== inputCurrencyAddress)
    }
  }, [
    isAnchorCurrencyDetected,
    anchorCurrency,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
  ])

  if (!rateInputCurrency || !rateOutputCurrency || !currentActiveRate) return null

  return (
    <Wrapper className={className}>
      {!noLabel && (
        <div>
          <Trans>Limit price</Trans>
          <InvertRateControl onClick={() => setCurrentIsInversed(!currentIsInversed)} />
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
