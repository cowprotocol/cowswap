import { useState, useCallback, useMemo, useEffect, ReactNode } from 'react'
import styled from 'styled-components/macro'
import { TransactionResponse } from '@ethersproject/providers'
import { AlertTriangle } from 'react-feather'
import { Currency, Token, CurrencyAmount } from '@uniswap/sdk-core'

import { ButtonSecondary, ButtonPrimary } from 'components/Button'
import Loader from 'components/Loader'
import WrappingVisualisation from './WrappingVisualisation'

import { useCurrencyBalances } from 'state/wallet/hooks'
import { useIsTransactionPending } from 'state/transactions/hooks'

import Modal from 'components/Modal'
import { useGasPrices } from 'state/gas/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { BigNumber } from 'ethers'
import {
  DEFAULT_GAS_FEE,
  MINIMUM_TXS,
  AVG_APPROVE_COST_GWEI,
  _isLowBalanceCheck,
  _setNativeLowBalanceError,
  _getAvailableTransactions,
} from './helpers'
import { t, Trans } from '@lingui/macro'

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  background: ${({ theme }) => theme.bg2};
  align-items: center;
  color: ${({ theme }) => theme.text1};
  justify-content: center;
  margin: 16px auto 8px;
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
      background-color: ${({ theme }) => theme.disabled};
    }
  }
`

const ModalMessage = styled.p`
  display: flex;
  flex-flow: row wrap;
  padding: 0 8px;
  width: 100%;
  color: ${({ theme }) => theme.wallet.color};
`

const ModalWrapper = styled(Wrapper)`
  margin: 0 auto;

  > h2 {
    color: ${({ theme }) => theme.wallet.color};
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
  nativeInput?: CurrencyAmount<Currency>
  wrapped: Token & { logoURI: string }
  wrapCallback: () => Promise<TransactionResponse>
}

export default function EthWethWrap({ account, native, nativeInput, wrapped, wrapCallback }: Props) {
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

    const amount = BigNumber.from(gas).mul(MINIMUM_TXS).mul(AVG_APPROVE_COST_GWEI)

    return {
      multiTxCost: CurrencyAmount.fromRawAmount(native, amount.toString()),
      singleTxCost: CurrencyAmount.fromFractionalAmount(native, amount.toString(), MINIMUM_TXS),
    }
  }, [gasPrice, native])

  const isWrapPending = useIsTransactionPending(pendingHash)
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])

  // does the user have a lower than set threshold balance? show error
  const { isLowBalance, txsRemaining } = useMemo(
    () => ({
      isLowBalance: _isLowBalanceCheck({
        threshold: multiTxCost,
        nativeInput,
        balance: nativeBalance,
        txCost: singleTxCost,
      }),
      txsRemaining: _getAvailableTransactions({ nativeBalance, nativeInput, singleTxCost }),
    }),
    [multiTxCost, nativeBalance, singleTxCost, nativeInput]
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
          <h2>
            <Trans>Confirm {nativeSymbol} wrap</Trans>
          </h2>
          <ModalMessage>
            <span>
              <Trans>
                CowSwap is a gasless exchange. <strong>{nativeSymbol}</strong> however, is required for paying{' '}
                <strong>
                  on-chain transaction costs associated with enabling tokens and the wrapping/unwrapping of{' '}
                  {nativeSymbol}/{wrappedSymbol}
                </strong>
                , respectively.
              </Trans>
            </span>
          </ModalMessage>
          <ModalMessage>
            <span>
              <Trans>
                At current gas prices, your remaining {nativeSymbol} balance after confirmation would be{' '}
                {!txsRemaining ? (
                  <strong>insufficient for any further on-chain transactions.</strong>
                ) : (
                  <>
                    sufficient for <strong>up to {txsRemaining} wrapping, unwrapping, or enabling operation(s)</strong>.
                  </>
                )}
              </Trans>
            </span>
          </ModalMessage>
          <WrappingVisualisation
            nativeSymbol={nativeSymbol}
            nativeBalance={nativeBalance}
            native={native}
            wrapped={wrapped}
            wrappedBalance={wrappedBalance}
            wrappedSymbol={wrappedSymbol}
            nativeInput={nativeInput}
          />
          <ButtonWrapper>
            <ButtonSecondary padding="0.5rem" maxWidth="30%" onClick={(): void => setModalOpen(false)}>
              <Trans>Cancel</Trans>
            </ButtonSecondary>
            <ButtonPrimary disabled={loading} padding="0.5rem" maxWidth="70%" onClick={handleWrap}>
              {loading ? <Loader /> : t`Wrap my ${nativeSymbol} anyways`}
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
        nativeInput={nativeInput}
      />
      {/* Wrap CTA */}
      <ButtonPrimary disabled={loading} padding="0.5rem" onClick={handlePrimaryAction}>
        {loading ? <Loader /> : t`Wrap my ${nativeSymbol}`}
      </ButtonPrimary>
    </Wrapper>
  )
}
