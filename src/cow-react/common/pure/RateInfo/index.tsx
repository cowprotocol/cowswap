import { formatSmart } from 'utils/format'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import { getQuoteCurrency } from '@cow/common/services/getQuoteCurrency'
import { getAddress } from '@cow/utils/getAddress'
import { SupportedChainId } from 'constants/chains'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { usePrice } from '@cow/common/hooks/usePrice'
import { transparentize } from 'polished'

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

const Wrapper = styled.div<{ stylized: boolean }>`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
`

const RateLabel = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => transparentize(0.2, theme.text1)};
  font-weight: 400;
  gap: 5px;
`

const InvertIcon = styled.div`
  --size: 20px;
  cursor: pointer;
  background: ${({ theme }) => theme.grey1};
  color: ${({ theme }) => theme.text1};
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease-in-out, color 0.15s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.bg2};

    > svg {
      stroke: ${({ theme }) => theme.white};
    }
  }
`

const RateWrapper = styled.button`
  display: inline;
  background: none;
  border: 0;
  outline: none;
  margin: 0;
  padding: 0;
  cursor: pointer;
  color: inherit;
  font-size: 13px;
  letter-spacing: -0.1px;
  text-align: left;
  font-weight: 500;
`

export const FiatRate = styled.span`
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
  font-weight: 400;
  text-align: right;
`

export function InvertRateControl({ onClick, className }: { onClick(): void; className?: string }) {
  return (
    <InvertIcon className={className} onClick={onClick}>
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

  const activeRate = usePrice(inputCurrencyAmount, outputCurrencyAmount)
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

  // Set isInversed based on quoteCurrency
  useEffect(() => {
    const [quoteCurrencyAddress, inputCurrencyAddress] = [getAddress(quoteCurrency), getAddress(inputCurrency)]

    setCurrentIsInversed(quoteCurrencyAddress !== inputCurrencyAddress)
  }, [quoteCurrency, inputCurrency, outputCurrency])

  if (!rateInputCurrency || !rateOutputCurrency || !currentActiveRate) return null

  return (
    <Wrapper stylized={stylized} className={className}>
      {!noLabel && (
        <RateLabel>
          <Trans>{label}</Trans>
          <InvertRateControl onClick={() => setCurrentIsInversed((state) => !state)} />
        </RateLabel>
      )}
      <div>
        <RateWrapper onClick={() => setCurrentIsInversed((state) => !state)}>
          <span title={currentActiveRate.toFixed(rateOutputCurrency.decimals) + ' ' + rateOutputCurrency.symbol}>
            1 {rateInputCurrency.symbol} = {formatSmart(currentActiveRate)} {rateOutputCurrency.symbol}
          </span>{' '}
          {!!fiatAmount && <FiatRate>(≈${formatSmart(fiatAmount, 2)})</FiatRate>}
        </RateWrapper>
      </div>
    </Wrapper>
  )
}
