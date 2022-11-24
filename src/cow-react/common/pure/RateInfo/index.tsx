import { formatSmart } from 'utils/format'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import { getQuoteCurrency } from '@cow/common/services/getQuoteCurrency'
import { getAddress } from '@cow/modules/limitOrders/utils/getAddress'
import { SupportedChainId } from 'constants/chains'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

export interface RateInfoParams {
  chainId: SupportedChainId | undefined
  inputCurrencyAmount: CurrencyAmount<Currency> | null
  outputCurrencyAmount: CurrencyAmount<Currency> | null
  activeRateFiatAmount: CurrencyAmount<Currency> | null
  inversedActiveRateFiatAmount: CurrencyAmount<Currency> | null
}

export interface RateInfoProps {
  className?: string
  label?: string
  stylized?: boolean
  noLabel?: boolean
  isInversed?: boolean
  rateInfoParams: RateInfoParams
}

const LightText = styled.span`
  font-weight: 400;
`

const Wrapper = styled.div<{ stylized: boolean }>`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  font-size: inherit;
  font-weight: 400;

  :hover > div:first-child span {
    opacity: 1;
  }

  ${LightText} {
    opacity: ${({ stylized }) => (stylized ? '0.7' : '1')};
  }
`

const InvertIcon = styled.div`
  background: ${({ theme }) => theme.grey1};
  color: ${({ theme }) => theme.text1};
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
      <Repeat size={11} />
    </InvertIcon>
  )
}

export function RateInfo({
  rateInfoParams,
  className,
  label = 'Limit price',
  stylized = false,
  isInversed = false,
  noLabel = false,
}: RateInfoProps) {
  const { chainId, inputCurrencyAmount, outputCurrencyAmount, activeRateFiatAmount, inversedActiveRateFiatAmount } =
    rateInfoParams

  const activeRate = useMemo(() => {
    return outputCurrencyAmount?.quotient && inputCurrencyAmount?.quotient
      ? new Fraction(outputCurrencyAmount.quotient, inputCurrencyAmount.quotient)
      : null
  }, [outputCurrencyAmount?.quotient, inputCurrencyAmount?.quotient])

  const inputCurrency = inputCurrencyAmount?.currency
  const outputCurrency = outputCurrencyAmount?.currency

  const [currentIsInversed, setCurrentIsInversed] = useState(isInversed)

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

  const quoteCurrency = useMemo(() => {
    return getQuoteCurrency(chainId, inputCurrencyAmount, outputCurrencyAmount)
  }, [chainId, inputCurrencyAmount, outputCurrencyAmount])

  useEffect(() => {
    setCurrentIsInversed((state) => !state)
  }, [isInversed])

  /**
   * @see getQuoteCurrency
   */
  useEffect(() => {
    if (quoteCurrency) {
      const [quoteCurrencyAddress, inputCurrencyAddress] = [getAddress(quoteCurrency), getAddress(inputCurrency)]

      setCurrentIsInversed(quoteCurrencyAddress !== inputCurrencyAddress)
    }
  }, [quoteCurrency, inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount])

  if (!rateInputCurrency || !rateOutputCurrency || !currentActiveRate) return null

  return (
    <Wrapper stylized={stylized} className={className}>
      {!noLabel && (
        <div>
          <LightText>
            <Trans>{label}</Trans>
            <InvertRateControl onClick={() => setCurrentIsInversed(!currentIsInversed)} />
          </LightText>
        </div>
      )}
      <div>
        <span title={currentActiveRate.toSignificant(18) + ' ' + rateInputCurrency.symbol}>
          <LightText>1 {rateInputCurrency.symbol}</LightText> = {formatSmart(currentActiveRate)}{' '}
          {rateOutputCurrency.symbol}
        </span>{' '}
        <LightText>{!!fiatAmount && <span>(≈${formatSmart(fiatAmount, 2)})</span>}</LightText>
      </div>
    </Wrapper>
  )
}
