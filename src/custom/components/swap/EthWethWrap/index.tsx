import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { TransactionResponse } from '@ethersproject/providers'
import { ArrowRight, AlertTriangle } from 'react-feather'
import { Currency, Token, CurrencyAmount } from '@uniswap/sdk'

import { ButtonPrimary } from 'components/Button'
import Loader from 'components/Loader'
import { WrapCardContainer, WrapCard } from './WrapCard'

import { useCurrencyBalances } from 'state/wallet/hooks'
import { useIsTransactionPending } from 'state/transactions/hooks'

import { colors } from 'theme'

const COLOUR_SHEET = colors(false)

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  background: ${({ theme }) => theme.bg2};
  align-items: center;
  justify-content: center;
  margin: 4.8px auto 0;
  padding: 16px;
  width: 100%;

  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  font-size: smaller;

  > ${ButtonPrimary} {
      background: #62d9ff;
      width: 75%;
      padding: 6.4px;
      margin-top: 4.8px;

      &:disabled {
        background-color: ${({ theme }) => theme.disabled}
      }
  }
`
const WarningWrapper = styled(Wrapper)`
  ${({ theme }) => theme.flexRowNoWrap}
  padding: 0;

  color: ${({ theme }) => theme.red1};
  font-weight: 600;
  font-size: small;

  // warning logo
  > svg {
    margin-right: 8px;
  }

  // warning text
  > div {
    ${({ theme }) => theme.flexColumnNoWrap}
    align-items: flex-start;
    justify-content: center;
    font-size: 90%;
  }
`

const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: space-between;
  width: 90%;
  padding: 8px 11.2px;
  margin: 8px 0;

  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};

  background: ${({ background = 'initial' }) => background};

  > span {
    &:first-child {
      margin-right: auto;
    }
  }
`

const ErrorWrapper = styled(BalanceLabel)`
  font-size: x-small;
  background-color: #ff000040;
  color: ${({ theme }) => theme.red1};
`

const ErrorMessage = ({ error }: { error: Error }) => (
  <ErrorWrapper>
    <i>
      <strong>{error.message}</strong>
    </i>
  </ErrorWrapper>
)

export interface Props {
  account?: string
  native: Currency
  userInput?: CurrencyAmount
  wrapped: Token
  wrapCallback: () => Promise<TransactionResponse>
}

export default function EthWethWrap({ account, native, userInput, wrapped, wrapCallback }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [pendingHash, setPendingHash] = useState<string | undefined>()

  const isWrapPending = useIsTransactionPending(pendingHash)
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])

  const wrappedSymbol = wrapped.symbol || 'wrapped native token'
  const nativeSymbol = native.symbol || 'native token'

  // Listen for changes in isWrapPending
  // and set loading local state accordingly..
  useEffect(() => {
    setLoading(isWrapPending)
  }, [isWrapPending])

  const handleWrap = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      const txResponse = await wrapCallback()
      setPendingHash(txResponse.hash)
    } catch (error) {
      console.error(error)

      setError(error)
      setLoading(false)
    }
  }, [wrapCallback])

  return (
    <Wrapper>
      <WarningWrapper>
        <AlertTriangle size={25} />
        <div>
          <span>
            To sell {nativeSymbol}, first wrap or switch to {wrappedSymbol}
          </span>
        </div>
      </WarningWrapper>
      {error && <ErrorMessage error={error} />}
      <WrapCardContainer>
        {/* To Wrap */}
        <WrapCard symbol={nativeSymbol} balance={nativeBalance} currency={native} amountToWrap={userInput} />

        <ArrowRight size={18} color={COLOUR_SHEET.primary1} />

        {/* Wrap Outcome */}
        <WrapCard symbol={wrappedSymbol} balance={wrappedBalance} currency={wrapped} amountToWrap={userInput} />
      </WrapCardContainer>

      <ButtonPrimary disabled={loading} padding="0.5rem" onClick={handleWrap}>
        {loading ? <Loader /> : `Wrap my ${nativeSymbol}`}
      </ButtonPrimary>
    </Wrapper>
  )
}
