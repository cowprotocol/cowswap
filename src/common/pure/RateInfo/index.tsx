import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import { getQuoteCurrency } from 'common/services/getQuoteCurrency'
import { getAddress } from 'utils/getAddress'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { usePrice } from 'common/hooks/usePrice'
import { transparentize } from 'polished'
import { TokenSymbol } from 'common/pure/TokenSymbol'
import { TokenAmount } from 'common/pure/TokenAmount'
import { FiatAmount } from 'common/pure/FiatAmount'

const DEFAULT_DECIMALS = 4

export interface RateInfoParams {
  chainId: SupportedChainId | undefined
  inputCurrencyAmount: CurrencyAmount<Currency> | null
  outputCurrencyAmount: CurrencyAmount<Currency> | null
  activeRateFiatAmount: CurrencyAmount<Currency> | null
  invertedActiveRateFiatAmount: CurrencyAmount<Currency> | null
}

export interface RateInfoProps {
  className?: string
  label?: string
  stylized?: boolean
  noLabel?: boolean
  prependSymbol?: boolean
  isInverted?: boolean
  setSmartQuoteSelectionOnce?: boolean
  doNotUseSmartQuote?: boolean
  isInvertedState?: [boolean, Dispatch<SetStateAction<boolean>>]
  rateInfoParams: RateInfoParams
  opacitySymbol?: boolean
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
  font-weight: 400;
  gap: 5px;
  text-align: left;
  transition: color 0.15s ease-in-out;
  color: ${({ theme }) => transparentize(0.2, theme.text1)};

  &:hover {
    color: ${({ theme }) => theme.text1};
  }
`

const InvertIcon = styled.div`
  --size: 17px;
  cursor: pointer;
  background: ${({ theme }) => transparentize(0.9, theme.text1)};
  color: ${({ theme }) => theme.text1};
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  min-height: var(--size);
  border-radius: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease-in-out, color 0.15s ease-in-out;

  > svg {
    padding: 1px;
  }

  &:hover {
    background: ${({ theme }) => theme.bg2};

    > svg {
      stroke: ${({ theme }) => theme.white};
    }
  }
`

export const RateWrapper = styled.button`
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
  text-align: right;
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
  setSmartQuoteSelectionOnce = false,
  doNotUseSmartQuote = false,
  stylized = false,
  isInverted = false,
  noLabel = false,
  prependSymbol = true,
  isInvertedState,
  opacitySymbol = false,
}: RateInfoProps) {
  const { chainId, inputCurrencyAmount, outputCurrencyAmount, activeRateFiatAmount, invertedActiveRateFiatAmount } =
    rateInfoParams

  const activeRate = usePrice(inputCurrencyAmount, outputCurrencyAmount)
  const inputCurrency = inputCurrencyAmount?.currency
  const outputCurrency = outputCurrencyAmount?.currency

  const [isSmartQuoteSelectionSet, setIsSmartQuoteSelectionSet] = useState(false)
  const customDispatcher = useState(isInverted)
  const [currentIsInverted, setCurrentIsInverted] = isInvertedState || customDispatcher

  const currentActiveRate = useMemo(() => {
    if (!activeRate) return null
    return currentIsInverted ? activeRate.invert() : activeRate
  }, [currentIsInverted, activeRate])

  const fiatAmount = useMemo(() => {
    return currentIsInverted ? invertedActiveRateFiatAmount : activeRateFiatAmount
  }, [currentIsInverted, activeRateFiatAmount, invertedActiveRateFiatAmount])

  const rateInputCurrency = useMemo(() => {
    return currentIsInverted ? outputCurrency : inputCurrency
  }, [currentIsInverted, inputCurrency, outputCurrency])

  const rateOutputCurrency = useMemo(() => {
    return currentIsInverted ? inputCurrency : outputCurrency
  }, [currentIsInverted, inputCurrency, outputCurrency])

  const quoteCurrency = useMemo(() => {
    return getQuoteCurrency(chainId, inputCurrencyAmount, outputCurrencyAmount)
  }, [chainId, inputCurrencyAmount, outputCurrencyAmount])

  useEffect(() => {
    setCurrentIsInverted(isInverted)
  }, [isInverted, setCurrentIsInverted])

  // Set isInverted based on quoteCurrency
  useEffect(() => {
    if (isSmartQuoteSelectionSet || doNotUseSmartQuote) return

    const [quoteCurrencyAddress, inputCurrencyAddress] = [getAddress(quoteCurrency), getAddress(inputCurrency)]

    setCurrentIsInverted(quoteCurrencyAddress !== inputCurrencyAddress)

    if (setSmartQuoteSelectionOnce) {
      setIsSmartQuoteSelectionSet(true)
    }
  }, [
    quoteCurrency,
    inputCurrency,
    outputCurrency,
    setCurrentIsInverted,
    isSmartQuoteSelectionSet,
    setIsSmartQuoteSelectionSet,
    setSmartQuoteSelectionOnce,
    doNotUseSmartQuote,
  ])

  if (!rateInputCurrency || !rateOutputCurrency || !currentActiveRate) return null

  return (
    <Wrapper stylized={stylized} className={className}>
      {!noLabel && (
        <RateLabel>
          <Trans>{label}</Trans>
          <InvertRateControl onClick={() => setCurrentIsInverted((state) => !state)} />
        </RateLabel>
      )}
      <div>
        <RateWrapper onClick={() => setCurrentIsInverted((state) => !state)}>
          <span
            title={
              currentActiveRate.toFixed(rateOutputCurrency.decimals || DEFAULT_DECIMALS) +
                ' ' +
                rateOutputCurrency.symbol || ''
            }
          >
            {prependSymbol && (
              <>
                1 <TokenSymbol token={rateInputCurrency} /> ={' '}
              </>
            )}
            <TokenAmount amount={currentActiveRate} tokenSymbol={rateOutputCurrency} opacitySymbol={opacitySymbol} />
          </span>{' '}
          {!!fiatAmount && (
            <FiatRate>
              (<FiatAmount amount={fiatAmount} />)
            </FiatRate>
          )}
        </RateWrapper>
      </div>
    </Wrapper>
  )
}
