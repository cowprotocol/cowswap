import { useCallback, useEffect, useMemo, useState } from 'react'

import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import CheckCircle from 'legacy/assets/cow-swap/check.svg'
import ImportantIcon from 'legacy/assets/cow-swap/important.svg'
import { ButtonConfirmed } from 'legacy/components/Button'
import CowProtocolLogo from 'legacy/components/CowProtocolLogo'
import Loader from 'legacy/components/Loader'
import { loadingOpacityMixin } from 'legacy/components/Loader/styled'
import { Input as NumericalInput } from 'legacy/components/NumericalInput'
import Row from 'legacy/components/Row'
import { ConfirmOperationType } from 'legacy/components/TransactionConfirmationModal'
import { AVG_APPROVE_COST_GWEI } from 'legacy/constants'
import { ONE_HUNDRED_PERCENT } from 'legacy/constants/misc'
import { useApproveCallbackFromClaim } from 'legacy/hooks/useApproveCallback'
import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useClaimDispatchers, useClaimState } from 'legacy/state/claim/hooks'
import { calculateInvestmentAmounts, calculatePercentage } from 'legacy/state/claim/hooks/utils'
import { useGasPrices } from 'legacy/state/gas/hooks'
import { ButtonSize } from 'legacy/theme/enum'
import { calculateGasMargin } from 'legacy/utils/calculateGasMargin'
import { getProviderErrorMessage } from 'legacy/utils/misc'

import useCurrencyBalance from 'modules/tokens/hooks/useCurrencyBalance'
import { useWalletInfo } from 'modules/wallet'

import { TokenAmount } from 'common/pure/TokenAmount'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { formatTokenAmount } from 'utils/amountFormat'
import { formatSymbol } from 'utils/format'

import { ApprovalState } from 'legacy/hooks/useApproveCallback/useApproveCallbackMod'
import { IS_TESTING_ENV } from '../const'
import {
  InvestAvailableBar,
  InvestInput,
  InvestSummary,
  InvestTokenGroup,
  TokenLogo,
  UnderlineButton,
  UserMessage,
  WarningWrapper,
} from '../styled'
import { EnhancedUserClaimData } from '../types'

import { InvestmentFlowProps } from '.'

const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
  ${loadingOpacityMixin}
`

const ErrorMessages = {
  NoBalance: (symbol = '') =>
    `You don't have ${formatSymbol(symbol)} balance to invest. Add sufficient ${formatSymbol(
      symbol
    )} balance or go back and uncheck ${formatSymbol(symbol)} as an investment option.`,

  InsufficientBalanceSelf: (symbol = '') => `Insufficient ${formatSymbol(symbol)} balance to cover investment amount`,
  InsufficientBalanceBehalf: (symbol = '') =>
    `Your ${formatSymbol(symbol)} balance is not enough to cover 100% of the investment amount.`,

  OverMaxInvestment: `Your investment amount can not be above the maximum investment allowed`,
  InvestmentIsZero: `Your investment amount can not be zero`,
  NotApproved: (symbol = '') => `Please approve ${formatSymbol(symbol)} token`,
  WaitForApproval: (symbol = '') => `Approving ${formatSymbol(symbol)}. Please wait until the transaction is mined.`,
}

const WarningMessages = {
  InsufficientNativeBalance: (symbol = '', amount = '') =>
    `You might not have enough ${formatSymbol(
      symbol
    )} to pay for the network transaction fee (estimated ${amount} ${formatSymbol(symbol)})`,
  NotMaxInvested: `Please note: after executing the transaction in the last step, you will not be able to invest anymore.`,
}

type InvestOptionProps = {
  claim: EnhancedUserClaimData
  openModal: InvestmentFlowProps['modalCbs']['openModal']
  closeModal: InvestmentFlowProps['modalCbs']['closeModal']
}

export default function InvestOption({ claim, openModal, closeModal }: InvestOptionProps) {
  const { currencyAmount, price, cost: maxCost, index } = claim

  const { account, chainId } = useWalletInfo()
  const { updateInvestAmount, updateInvestError, setIsTouched } = useClaimDispatchers()
  const { investFlowData, activeClaimAccount, estimatedGas } = useClaimState()

  // Approve hooks
  const {
    approvalState: approveState,
    approve: approveCallback,
    revokeApprove: revokeApprovalCallback, // CURRENTLY TEST ONLY (not on prod, barn or ens)
    isPendingApproval: isPendingRevoke, // CURRENTLY TEST ONLY (not on prod, barn or ens)
  } = useApproveCallbackFromClaim({
    openTransactionConfirmationModal: (message: string, operationType: ConfirmOperationType) =>
      openModal(message, operationType),
    closeModals: closeModal,
    claim,
  })

  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()

  const [percentage, setPercentage] = useState<string>('0')
  const [typedValue, setTypedValue] = useState<string>('')
  const [inputWarnings, setInputWarnings] = useState<string[]>([])

  const investedAmount = investFlowData[index].investedAmount
  const inputError = investFlowData[index].error
  const isTouched = investFlowData[index].isTouched

  // Syntactic sugar fns for setting/resetting global state
  const setInvestedAmount = useCallback(
    (amount: string) => updateInvestAmount({ index, amount }),
    [index, updateInvestAmount]
  )
  const setInputError = useCallback((error: string) => updateInvestError({ index, error }), [index, updateInvestError])
  const resetInputError = useCallback(() => updateInvestError({ index, error: undefined }), [index, updateInvestError])
  const setInputTouched = useCallback(
    (value: boolean) => setIsTouched({ index, isTouched: value }),
    [index, setIsTouched]
  )

  const token = currencyAmount?.currency
  const isNative = token?.isNative
  const balance = useCurrencyBalance(account || undefined, token)

  const gasPrice = useGasPrices(isNative ? chainId : undefined)

  const isSelfClaiming = account === activeClaimAccount
  const noBalance = !balance || balance.equalTo('0')

  const onUserInput = (input: string) => {
    setTypedValue(input)
    setInputTouched(true)
  }

  const gasCost = useMemo(() => {
    if (!estimatedGas || !isNative || !chainId) {
      return
    }

    // Based on how much gas will be used (estimatedGas) and current gas prices (if available)
    // calculate how much that would cost in native currency.
    // We pick `fast` to be conservative. Also, it's non-blocking, so the user is aware but can proceed
    const amount = calculateGasMargin(BigNumber.from(estimatedGas).mul(gasPrice?.fast || AVG_APPROVE_COST_GWEI))

    return CurrencyAmount.fromRawAmount(token, amount.toString())
  }, [chainId, estimatedGas, gasPrice?.fast, isNative, token])

  // on invest max amount click handler
  const setMaxAmount = useCallback(() => {
    if (!maxCost || noBalance) {
      return
    }

    const value = maxCost.greaterThan(balance) ? balance : maxCost
    setTypedValue(value.toExact() || '')
    setInputTouched(true)
  }, [balance, maxCost, noBalance, setInputTouched])

  // Save "local" approving state for rendering spinners etc
  const [approving, setApproving] = useState(false)
  const isApproved = approveState === ApprovalState.APPROVED
  const notApproved = !isApproved
  // on chain tx mining pending
  const isPendingOnchainApprove = approveState === ApprovalState.PENDING
  // local pending or on chain mining wait for approval
  // "notApproved" here is for weeding out revoking approval pending
  const isPendingApprove = notApproved && (approving || isPendingOnchainApprove)

  const handleApprove = useCallback(async () => {
    // reset errors and close any modals
    handleCloseError()

    if (!approveCallback) return

    try {
      setApproving(true)
      const summary = `Approve ${token?.symbol || 'token'} for investing in vCOW`
      await approveCallback({ modalMessage: summary, transactionSummary: summary })
    } catch (error: any) {
      console.error('[InvestOption]: Issue approving.', error)
      handleSetError(getProviderErrorMessage(error))
    } finally {
      setApproving(false)
    }
  }, [approveCallback, handleCloseError, handleSetError, token?.symbol])

  // CURRENTLY TEST ONLY (not on prod, barn or ens)
  const handleRevokeApproval = useCallback(async () => {
    // reset errors and close any modals
    handleCloseError()

    if (!revokeApprovalCallback) return

    try {
      setApproving(true)
      const summary = `Revoke ${token?.symbol || 'token'} approval for vCOW contract`
      await revokeApprovalCallback({
        modalMessage: summary,
        transactionSummary: summary,
      })
    } catch (error: any) {
      console.error('[InvestOption]: Issue revoking approval.', error)
      handleSetError(getProviderErrorMessage(error))
    } finally {
      setApproving(false)
    }
  }, [handleCloseError, handleSetError, revokeApprovalCallback, token?.symbol])

  const vCowAmount = useMemo(
    () => calculateInvestmentAmounts(claim, investedAmount)?.vCowAmount,
    [claim, investedAmount]
  )

  // if there is investmentAmount in redux state for this option set it as typedValue
  useEffect(() => {
    const { investmentCost } = calculateInvestmentAmounts(claim, investedAmount)

    if (!investmentCost) {
      return
    }

    if (!investmentCost?.equalTo(0)) {
      setTypedValue(investmentCost?.toExact())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // if we are claiming for someone else we will set values to max
  useEffect(() => {
    if (!balance || !maxCost) {
      return
    }

    if (!isSelfClaiming) {
      setMaxAmount()
    }
  }, [balance, isSelfClaiming, maxCost, setMaxAmount])

  // handle input value change and errors
  useEffect(() => {
    let error = null

    const parsedAmount = tryParseCurrencyAmount(typedValue, token)

    if (!maxCost || !balance) {
      return
    }

    // set different errors in order of importance
    if (noBalance) {
      error = ErrorMessages.NoBalance(token?.symbol)
    } else if (balance.lessThan(maxCost) && !isSelfClaiming) {
      error = ErrorMessages.InsufficientBalanceBehalf(token?.symbol)
    } else if (isPendingOnchainApprove) {
      error = ErrorMessages.WaitForApproval(token?.symbol)
    } else if (!isNative && !isApproved) {
      error = ErrorMessages.NotApproved(token?.symbol)
    } else if (!parsedAmount && !isTouched) {
      // this is to remove initial zero balance error message until user touches the input
      error = ''
    } else if (!parsedAmount) {
      error = ErrorMessages.InvestmentIsZero
    } else if (parsedAmount.greaterThan(maxCost)) {
      error = ErrorMessages.OverMaxInvestment
    } else if (parsedAmount.greaterThan(balance)) {
      error = ErrorMessages.InsufficientBalanceSelf(token?.symbol)
    }

    // Set percentage
    let percentageValue
    if (noBalance || !parsedAmount) {
      percentageValue = '0'
    } else {
      percentageValue = formatTokenAmount(calculatePercentage(parsedAmount, maxCost)) || '0'
    }
    setPercentage(percentageValue)

    // Set invested amount and error/warnings
    if (error !== null) {
      setInputError(error)
    } else {
      if (!parsedAmount) {
        return
      }

      // update redux state to remove error for this field
      resetInputError()

      // update redux state with new investAmount value
      setInvestedAmount(parsedAmount.quotient.toString())
    }
  }, [
    balance,
    typedValue,
    isSelfClaiming,
    token,
    isNative,
    isApproved,
    isPendingOnchainApprove,
    maxCost,
    setInputError,
    resetInputError,
    setInvestedAmount,
    percentage,
    gasCost,
    isTouched,
    noBalance,
  ])

  useEffect(() => {
    const warnings = []

    const parsedAmount = tryParseCurrencyAmount(typedValue, token)

    if (!parsedAmount || !maxCost || !balance || inputError) {
      setInputWarnings([])
      return
    }

    if (calculatePercentage(parsedAmount, maxCost).lessThan(ONE_HUNDRED_PERCENT)) {
      warnings.push(WarningMessages.NotMaxInvested)
    }

    if (isNative && gasCost && parsedAmount.add(gasCost).greaterThan(balance)) {
      warnings.push(WarningMessages.InsufficientNativeBalance(token?.symbol, formatTokenAmount(gasCost)))
    }

    setInputWarnings(warnings.length ? warnings : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasCost, isNative, maxCost, token, typedValue, inputError])

  return (
    <InvestTokenGroup>
      <div>
        <h3>Buy vCOW with {currencyAmount?.currency?.symbol}</h3>
        <span>
          <TokenLogo symbol={currencyAmount?.currency?.symbol || '-'} size={72} />
          <CowProtocolLogo size={72} />
        </span>
      </div>

      <span>
        <InvestSummary>
          <span>
            <b>Price</b>{' '}
            <i>
              <TokenAmount amount={price} defaultValue="0" tokenSymbol={price?.quoteCurrency} /> per{' '}
              {currencyAmount?.currency?.symbol}
            </i>
          </span>

          <span>
            <b>Max. investment available</b>{' '}
            <i>
              <TokenAmount amount={maxCost} defaultValue="0" tokenSymbol={maxCost?.currency} />
            </i>
          </span>

          <span>
            <b>Token approval</b>
            {!isNative ? (
              <i>
                {isPendingApprove ? (
                  <span style={{ fontStyle: 'italic' }}>{`Approving ${currencyAmount?.currency?.symbol}...`}</span>
                ) : notApproved ? (
                  <span>{`${currencyAmount?.currency?.symbol} not approved!`}</span>
                ) : (
                  <Row>
                    <img src={CheckCircle} alt="Approved" />
                    <span>{currencyAmount?.currency?.symbol} approved</span>
                  </Row>
                )}
              </i>
            ) : (
              // Native token does not need approval
              <i>
                <Row>
                  <img src={CheckCircle} alt="Approved" />
                  <span>Approval not required!</span>
                </Row>
              </i>
            )}
            {/* Token Approve buton - not shown for ETH */}
            {!isNative && notApproved && (
              <ButtonConfirmed
                buttonSize={ButtonSize.SMALL}
                onClick={handleApprove}
                disabled={isPendingApprove}
                altDisabledStyle={isPendingApprove} // show solid button while waiting
              >
                {isPendingApprove ? <Loader stroke="white" /> : <span>Approve {currencyAmount?.currency?.symbol}</span>}
              </ButtonConfirmed>
            )}
            {
              // CURRENTLY TEST ONLY (not on prod, barn or ens)
              IS_TESTING_ENV && isApproved && (
                <UnderlineButton disabled={approving || isPendingRevoke} onClick={handleRevokeApproval}>
                  {(approving || isPendingRevoke) && <Loader size="12px" />}
                  {approving || isPendingRevoke ? 'Revoking approval...' : 'Revoke approval'}{' '}
                </UnderlineButton>
              )
            }
          </span>

          <span>
            <b>Available investment used</b>
            <InvestAvailableBar percentage={Number(percentage)} />
          </span>
        </InvestSummary>
        {/* Error modal */}
        <ErrorModal />
        {/* Investment inputs */}
        <InvestInput disabled={noBalance || !isSelfClaiming}>
          <div>
            <label>
              <span>
                <b>Balance:</b>
                <i>
                  <TokenAmount amount={balance} defaultValue="0" tokenSymbol={currencyAmount?.currency} />
                </i>
                {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
                {!noBalance && isSelfClaiming && (
                  <UnderlineButton disabled={!isSelfClaiming} onClick={setMaxAmount}>
                    {' '}
                    (invest max. possible)
                  </UnderlineButton>
                )}
              </span>
              <StyledNumericalInput
                onUserInput={onUserInput}
                disabled={noBalance || !isSelfClaiming}
                placeholder="0"
                $loading={false}
                value={typedValue}
              />
              <b>{currencyAmount?.currency?.symbol}</b>
            </label>
            <i>
              Receive: <TokenAmount amount={vCowAmount} defaultValue="0" tokenSymbol={vCowAmount?.currency} />
            </i>
            {/* Insufficient balance validation error */}
            {inputError && (
              <UserMessage variant="danger">
                <SVG src={ImportantIcon} description="Warning" />
                <span>{inputError}</span>
              </UserMessage>
            )}
            {inputWarnings.length ? (
              <WarningWrapper>
                {inputWarnings.map((warning) => (
                  <UserMessage key={warning} variant="info">
                    <SVG src={ImportantIcon} description="Information" />
                    <span>{warning}</span>
                  </UserMessage>
                ))}
              </WarningWrapper>
            ) : null}
          </div>
        </InvestInput>
      </span>
    </InvestTokenGroup>
  )
}
