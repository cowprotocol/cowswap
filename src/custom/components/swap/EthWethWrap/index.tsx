import React, { useState, useCallback, useMemo, useEffect } from 'react'
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
import { LOW_NATIVE_BALANCE_THRESHOLD, DEFAULT_PRECISION } from 'constants/index'

const COLOUR_SHEET = colors(false)

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  background: ${({ theme }) => theme.bg2};
  align-items: center;
  justify-content: center;
  margin: 24px auto 0;
  padding: 14px 14px 22px;
  width: 100%;
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  font-size: smaller;

  > ${ButtonPrimary} {
      background: #62d9ff;
      width: 100%;
      padding: 6px;
      margin: 6px auto 0;

      &:disabled {
        background-color: ${({ theme }) => theme.disabled}
      }
  }
`
const WarningWrapper = styled(Wrapper)`
  ${({ theme }) => theme.flexRowNoWrap}
  padding: 0;
  margin: 0;
  color: ${({ theme }) => theme.redShade};
  font-weight: bold;
  font-size: small;

  // warning logo
  > svg {
    margin: 0 8px 0 0;
  }

  // warning text
  > div {
    ${({ theme }) => theme.flexColumnNoWrap}
    align-items: flex-start;
    justify-content: center;
    font-size: 14px;
  }
`

const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: space-between;
  text-align: center;
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  background: ${({ background = 'initial' }) => background};

  > span {
    &:first-of-type {
      margin-right: auto;
    }
  }
`

const ErrorWrapper = styled(BalanceLabel)`
  width: 100%;
  margin: 12px auto 0;
  font-size: 12px;
  background-color: #ffefea;
  color: ${({ theme }) => theme.redShade};
`

const ErrorMessage = ({ error }: { error: Error }) => (
  <ErrorWrapper>
    <strong>{error.message}</strong>
  </ErrorWrapper>
)

export interface Props {
  account?: string
  native: Currency
  userInput?: CurrencyAmount
  wrapped: Token
  wrapCallback: () => Promise<TransactionResponse>
}

const setNativeLowBalanceError = (nativeSymbol: string) =>
  new Error(
    `WARNING! After wrapping your ${nativeSymbol}, your balance will fall below < ${LOW_NATIVE_BALANCE_THRESHOLD.toSignificant(
      DEFAULT_PRECISION
    )} ${nativeSymbol}. As a result you may not have sufficient ${nativeSymbol} left to cover future on-chain transaction costs.`
  )

function checkUserBalance(userInput?: CurrencyAmount, balance?: CurrencyAmount) {
  if (!userInput || !balance || userInput.greaterThan(balance)) return true

  return balance.subtract(userInput).lessThan(LOW_NATIVE_BALANCE_THRESHOLD)
}

export default function EthWethWrap({ account, native, userInput, wrapped, wrapCallback }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [pendingHash, setPendingHash] = useState<string | undefined>()

  const isWrapPending = useIsTransactionPending(pendingHash)
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])

  // does the user have a lower than set threshold balance? show error
  const isLowBalance = useMemo(() => checkUserBalance(userInput, nativeBalance), [nativeBalance, userInput])

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
          Wrap your {nativeSymbol} first or switch to {wrappedSymbol}!
        </div>
      </WarningWrapper>
      {isLowBalance && <ErrorMessage error={setNativeLowBalanceError(nativeSymbol)} />}
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
