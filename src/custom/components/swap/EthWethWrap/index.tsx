import { useState, useCallback, useMemo, useEffect } from 'react'
import styled from 'styled-components/macro'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, Token, CurrencyAmount } from '@uniswap/sdk-core'

import { ButtonPrimary } from 'components/Button'
import WrappingVisualisation from './WrappingVisualisation'

import { useCurrencyBalances } from 'state/connection/hooks'
import { useIsTransactionPending } from 'state/enhancedTransactions/hooks'

import { useGasPrices } from 'state/gas/hooks'
import { useWeb3React } from '@web3-react/core'
import { _isLowBalanceCheck, _getAvailableTransactions, _estimateTxCost } from './helpers'
import { Trans } from '@lingui/macro'
import SimpleAccountDetails from '../../AccountDetails/SimpleAccountDetails'
import Loader from 'components/Loader'
import { useCloseModals } from 'state/application/hooks'
import { CloseIcon, ThemedText } from 'theme'
import { RowBetween } from 'components/Row'

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  justify-content: center;
  width: 100%;
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  font-size: smaller;
  overflow: hidden;

  margin: 0 auto;
  padding: 24px 24px;
  background: ${({ theme }) => theme.bg4};

  > h2 {
    color: ${({ theme }) => theme.wallet.color};
  }

  > ${ButtonPrimary} {
    background: #62d9ff;
    width: 100%;
    padding: 6px;
    margin: 6px auto 0;

    &:disabled {
      background-color: ${({ theme }) => theme.disabled};
    }
  }
`

const ModalMessage = styled.p`
  display: flex;
  flex-flow: row wrap;
  padding: 0;
  margin-bottom: 20px;
  width: 100%;
  color: ${({ theme }) => theme.wallet.color};
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 16px;
  width: 100%;
  margin-top: 8px;
`

export interface Props {
  account?: string
  native: Currency
  isNativeIn: boolean
  nativeInput?: CurrencyAmount<Currency>
  wrapped: Token & { logoURI: string }
  wrapCallback: () => Promise<[TransactionResponse | undefined, TransactionResponse | undefined]>
  swapCallback: () => void
}

export default function EthWethWrap({
  account,
  native,
  isNativeIn,
  nativeInput,
  wrapped,
  wrapCallback,
  swapCallback,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [, setModalOpen] = useState<boolean>(false)
  const [pendingHashMap, setPendingHashMap] = useState<{ approveHash?: string; wrapHash?: string }>({
    approveHash: undefined,
    wrapHash: undefined,
  })

  const { chainId } = useWeb3React()
  const gasPrice = useGasPrices(chainId)

  // returns the cost of 1 tx and multi txs
  const { multiTxCost, singleTxCost } = useMemo(() => _estimateTxCost(gasPrice, native), [gasPrice, native])

  const isApprovePending = useIsTransactionPending(pendingHashMap.approveHash)
  const isWrapPending = useIsTransactionPending(pendingHashMap.wrapHash)
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])
  const closeModals = useCloseModals()

  // does the user have a lower than set threshold balance? show error
  const balanceChecks: { isLowBalance: boolean; txsRemaining: string | null } | undefined = useMemo(() => {
    if (!isNativeIn) return undefined

    return {
      isLowBalance: _isLowBalanceCheck({
        threshold: multiTxCost,
        nativeInput,
        balance: nativeBalance,
        txCost: singleTxCost,
      }),
      txsRemaining: _getAvailableTransactions({ nativeBalance, nativeInput, singleTxCost }),
    }
  }, [isNativeIn, multiTxCost, nativeBalance, nativeInput, singleTxCost])

  const wrappedSymbol = wrapped.symbol || 'wrapped native token'
  const nativeSymbol = native.symbol || 'native token'

  // Listen for changes in isWrapPending
  // and set loading local state accordingly..
  useEffect(() => {
    setLoading(isApprovePending || isWrapPending)
  }, [isApprovePending, isWrapPending])

  const handleWrap = useCallback(async () => {
    setModalOpen(true)
    setError(null)
    setLoading(true)

    try {
      const [wrapTx, approveTx] = await wrapCallback()
      setPendingHashMap((currTx) => ({
        ...currTx,
        wrapHash: wrapTx?.hash,
        approveHash: approveTx?.hash,
      }))
    } catch (error) {
      console.error(error)

      setError(error)
      setLoading(false)
      closeModals()
    } finally {
      if (!isNativeIn) {
        closeModals()
      }
    }
  }, [isNativeIn, closeModals, wrapCallback])

  // wrap on comp mount
  useEffect(() => {
    handleWrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Wrapper>
      <RowBetween marginBottom={20}>
        <ThemedText.MediumHeader>
          <Trans>{isNativeIn ? `Wrapping your ${nativeSymbol}` : `Unwrapping your ${wrappedSymbol}`}</Trans>
        </ThemedText.MediumHeader>
        <CloseIcon onClick={() => closeModals()} />
      </RowBetween>

      <ModalMessage>
        <span>
          <Trans>
            Submit {isNativeIn ? 'a wrapping' : 'an unwrapping'} transaction to convert your{' '}
            {isNativeIn ? nativeSymbol : wrappedSymbol} to {isNativeIn ? wrappedSymbol : nativeSymbol}
          </Trans>
        </span>
      </ModalMessage>
      {balanceChecks?.isLowBalance && (
        <ModalMessage>
          <span>
            <Trans>
              At current gas prices, your remaining {nativeSymbol} balance after confirmation would be{' '}
              {!balanceChecks.txsRemaining ? (
                <strong>insufficient for any further on-chain transactions.</strong>
              ) : (
                <>
                  sufficient for{' '}
                  <strong>up to {balanceChecks.txsRemaining} wrapping, unwrapping, or enabling operation(s)</strong>.
                </>
              )}
            </Trans>
          </span>
        </ModalMessage>
      )}
      <SimpleAccountDetails
        pendingTransactions={['0x_WRAP', '0x_APPROVE'] /* Object.values(pendingHashMap) */}
        confirmedTransactions={[]}
      />
      <WrappingVisualisation
        nativeSymbol={nativeSymbol}
        nativeBalance={nativeBalance}
        native={native}
        wrapped={wrapped}
        wrappedBalance={wrappedBalance}
        wrappedSymbol={wrappedSymbol}
        nativeInput={nativeInput}
      />
      {isNativeIn && (
        <ButtonWrapper>
          <ButtonPrimary disabled={loading || !!error} padding="0.5rem" maxWidth="70%" onClick={swapCallback}>
            {loading ? <Loader /> : <Trans>Swap</Trans>}
          </ButtonPrimary>
        </ButtonWrapper>
      )}
    </Wrapper>
  )
}
