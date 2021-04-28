import React, { useState, useCallback, useMemo, useEffect, ReactNode } from 'react'
import styled from 'styled-components'
import { TransactionResponse } from '@ethersproject/providers'
import { AlertTriangle } from 'react-feather'
import { Currency, Token, CurrencyAmount } from '@uniswap/sdk'

import { ButtonSecondary, ButtonPrimary } from 'components/Button'
import Loader from 'components/Loader'
import WrappingVisualisation from './WrappingVisualisation'

import { useCurrencyBalances } from 'state/wallet/hooks'
import { useIsTransactionPending } from 'state/transactions/hooks'

import Modal from 'components/Modal'
import { useGasPrices } from 'state/gas/hooks'
import { useActiveWeb3React } from 'hooks'
import { BigNumber } from 'ethers'
import {
  DEFAULT_GAS_FEE,
  MINIMUM_TXS,
  AVG_APPROVE_COST_GWEI,
  _isLowBalanceCheck,
  _setNativeLowBalanceError,
  _getAvailableTransactions
} from './helpers'

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

const ModalMessage = styled.p`
  display: flex;
  flex-flow: row wrap;
  padding: 0 8px;
  width: 100%;
`

const ModalWrapper = styled(Wrapper)`
  margin: 0 auto;
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

const ButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 16px;
  width: 100%;
  margin-top: 8px;
`

const ErrorMessage = ({ error }: { error: Error }) => (
  <ErrorWrapper>
    <strong>{error.message}</strong>
  </ErrorWrapper>
)

const WarningLabel = ({ children }: { children?: ReactNode }) => (
  <WarningWrapper>
    <AlertTriangle size={25} />
    <div>{children}</div>
  </WarningWrapper>
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
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [pendingHash, setPendingHash] = useState<string | undefined>()

  const { chainId } = useActiveWeb3React()
  const gasPrice = useGasPrices(chainId)

  // returns the cost of 1 tx and multi txs
  const { multiTxCost, singleTxCost } = useMemo(() => {
    // TODO: should use DEFAULT_GAS_FEE from backup source
    // when/if implemented
    const gas = gasPrice?.standard || DEFAULT_GAS_FEE

    const amount = BigNumber.from(gas)
      .mul(MINIMUM_TXS)
      .mul(AVG_APPROVE_COST_GWEI)

    return {
      multiTxCost: CurrencyAmount.ether(amount.toString()),
      singleTxCost: CurrencyAmount.ether(amount.div(MINIMUM_TXS).toString())
    }
  }, [gasPrice])

  const isWrapPending = useIsTransactionPending(pendingHash)
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])

  // does the user have a lower than set threshold balance? show error
  const { isLowBalance, txsRemaining } = useMemo(
    () => ({
      isLowBalance: _isLowBalanceCheck({
        threshold: multiTxCost,
        userInput,
        balance: nativeBalance,
        txCost: singleTxCost
      }),
      txsRemaining: _getAvailableTransactions({ nativeBalance, userInput, singleTxCost })
    }),
    [multiTxCost, nativeBalance, singleTxCost, userInput]
  )

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
    } finally {
      setModalOpen(false)
    }
  }, [wrapCallback])

  // if low balance, clicking CTA opens modal, else opens wallet prompt
  const handlePrimaryAction = isLowBalance ? () => setModalOpen(true) : handleWrap

  return (
    <Wrapper>
      {/* Conditional Confirmation modal */}
      <Modal isOpen={modalOpen} onDismiss={() => setModalOpen(false)}>
        <ModalWrapper>
          <h2>Confirm {nativeSymbol} wrap</h2>
          <ModalMessage>
            <span>
              Cow Swap is a gasless exchange. <strong>{nativeSymbol}</strong> however, is required for paying{' '}
              <strong>
                on-chain transaction costs associated with enabling tokens and the wrapping/unwrapping of {nativeSymbol}
                /{wrappedSymbol}
              </strong>
              , respectively.
            </span>
          </ModalMessage>
          <ModalMessage>
            <span>
              At current gas prices, your remaining {nativeSymbol} balance after confirmation would be{' '}
              {!txsRemaining ? (
                <strong>insufficient for any further on-chain transactions.</strong>
              ) : (
                <>
                  sufficient for <strong>up to {txsRemaining} wrapping, unwrapping, or enabling operation(s)</strong>.
                </>
              )}
            </span>
          </ModalMessage>
          <WrappingVisualisation
            nativeSymbol={nativeSymbol}
            nativeBalance={nativeBalance}
            native={native}
            wrapped={wrapped}
            wrappedBalance={wrappedBalance}
            wrappedSymbol={wrappedSymbol}
            userInput={userInput}
          />
          <ButtonWrapper>
            <ButtonSecondary padding="0.5rem" maxWidth="30%" onClick={(): void => setModalOpen(false)}>
              Cancel
            </ButtonSecondary>
            <ButtonPrimary disabled={loading} padding="0.5rem" maxWidth="70%" onClick={handleWrap}>
              {loading ? <Loader /> : `Wrap my ${nativeSymbol} anyways`}
            </ButtonPrimary>
          </ButtonWrapper>
        </ModalWrapper>
      </Modal>
      {/* Primary warning label */}
      <WarningLabel>
        Wrap your {nativeSymbol} first or switch to {wrappedSymbol}!
      </WarningLabel>
      {/* Low Balance Error */}
      {isLowBalance && <ErrorMessage error={_setNativeLowBalanceError(nativeSymbol)} />}
      {/* Async Error */}
      {error && <ErrorMessage error={error} />}
      {/* Wrapping cards */}
      <WrappingVisualisation
        nativeSymbol={nativeSymbol}
        nativeBalance={nativeBalance}
        native={native}
        wrapped={wrapped}
        wrappedBalance={wrappedBalance}
        wrappedSymbol={wrappedSymbol}
        userInput={userInput}
      />
      {/* Wrap CTA */}
      <ButtonPrimary disabled={loading} padding="0.5rem" onClick={handlePrimaryAction}>
        {loading ? <Loader /> : `Wrap my ${nativeSymbol}`}
      </ButtonPrimary>
    </Wrapper>
  )
}
