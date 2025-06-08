import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

import { getAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { FiatAmount, TokenAmount, TokenSymbol, UI } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { usePrice } from 'common/hooks/usePrice'
import { getQuoteCurrency } from 'common/services/getQuoteCurrency'

const DEFAULT_DECIMALS = 4

export interface RateInfoParams {
  chainId: SupportedChainId
  inputCurrencyAmount: Nullish<CurrencyAmount<Currency>>
  outputCurrencyAmount: Nullish<CurrencyAmount<Currency>>
  activeRateFiatAmount: Nullish<CurrencyAmount<Currency>>
  invertedActiveRateFiatAmount: Nullish<CurrencyAmount<Currency>>
}

export interface RateInfoProps {
  className?: string
  label?: React.ReactNode
  stylized?: boolean
  noLabel?: boolean
  prependSymbol?: boolean
  isInverted?: boolean
  setSmartQuoteSelectionOnce?: boolean
  doNotUseSmartQuote?: boolean
  isInvertedState?: [boolean, Dispatch<SetStateAction<boolean>>]
  rateInfoParams: RateInfoParams
  opacitySymbol?: boolean
  noFiat?: boolean
  rightAlign?: boolean
}

const Wrapper = styled.div<{ stylized: boolean }>`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  gap: 10px;
  flex: 1 1 min-content;
`

const RateLabel = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  gap: 5px;
  text-align: left;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
  color: inherit;
  white-space: nowrap;
`

const InvertIcon = styled.div`
  --size: 17px;
  cursor: pointer;
  color: inherit;
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  min-height: var(--size);
  border-radius: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    background: currentColor;
    opacity: 0.1;
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    width: var(--size);
    height: var(--size);
    min-width: var(--size);
    min-height: var(--size);
    border-radius: var(--size);
    transition:
      background var(${UI.ANIMATION_DURATION}) ease-in-out,
      var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  > svg {
    padding: 1px;
    stroke: currentColor;
    z-index: 5;
    transition: stroke var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:hover {
    &::before {
      opacity: 1;
      background: var(${UI.COLOR_PRIMARY});
      color: var(${UI.COLOR_BUTTON_TEXT});
    }

    > svg {
      stroke: var(${UI.COLOR_BUTTON_TEXT});
    }
  }
`

export const RateWrapper = styled.button<{ rightAlign?: boolean }>`
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
  text-align: ${({ rightAlign }) => (rightAlign ? 'right' : 'left')};
  font-weight: 500;
  width: 100%;
`

export const FiatRate = styled.span`
  color: inherit;
  opacity: 0.7;
  font-weight: 400;
  text-align: right;
  white-space: nowrap;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function InvertRateControl({ onClick, className }: { onClick(): void; className?: string }) {
  return (
    <InvertIcon className={className} onClick={onClick}>
      <Repeat size={11} />
    </InvertIcon>
  )
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
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
  noFiat = false,
  rightAlign = false,
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
    if (noFiat) return null
    return currentIsInverted ? invertedActiveRateFiatAmount : activeRateFiatAmount
  }, [noFiat, currentIsInverted, invertedActiveRateFiatAmount, activeRateFiatAmount])

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

    if (!quoteCurrencyAddress || !inputCurrencyAddress) return

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

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const toggleInverted = () => setCurrentIsInverted((state) => !state)

  return (
    <Wrapper stylized={stylized} className={className}>
      {!noLabel && (
        <RateLabel>
          <Trans>{label}</Trans>
          <InvertRateControl onClick={toggleInverted} />
        </RateLabel>
      )}
      <div>
        <RateWrapper onClick={toggleInverted} rightAlign={rightAlign}>
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
            <TokenAmount
              amount={currentActiveRate}
              tokenSymbol={rateOutputCurrency}
              opacitySymbol={opacitySymbol}
              clickable
            />
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
