import { useCallback, useMemo, useState, useEffect } from 'react'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { BigNumber } from '@ethersproject/bignumber'

import CowProtocolLogo from 'components/CowProtocolLogo'
import { InvestTokenGroup, TokenLogo, InvestSummary, InvestInput, InvestAvailableBar, UnderlineButton } from '../styled'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import Row from 'components/Row'
import CheckCircle from 'assets/cow-swap/check.svg'
import { InvestmentFlowProps } from '.'
import { ApprovalState, useApproveCallbackFromClaim } from 'hooks/useApproveCallback'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import { StyledNumericalInput } from 'components/CurrencyInputPanel/CurrencyInputPanelMod'

import { ButtonConfirmed } from 'components/Button'
import { ButtonSize } from 'theme'
import Loader from 'components/Loader'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import { tryParseAmount } from 'state/swap/hooks'
import { calculateInvestmentAmounts, calculatePercentage } from 'state/claim/hooks/utils'
import { AMOUNT_PRECISION, PERCENTAGE_PRECISION } from 'constants/index'
import { useGasPrices } from 'state/gas/hooks'
import { AVG_APPROVE_COST_GWEI } from 'components/swap/EthWethWrap/helpers'
import { EnhancedUserClaimData } from '../types'
import { OperationType } from 'components/TransactionConfirmationModal'

const ErrorMsgs = {
  InsufficientBalance: (symbol = '') => `Insufficient ${symbol} balance to cover investment amount`,
  OverMaxInvestment: `Your investment amount can't be above the maximum investment allowed`,
  InvestmentIsZero: `Your investment amount can't be zero`,
  NotApproved: (symbol = '') => `Please approve ${symbol} token`,
  InsufficientNativeBalance: (symbol = '', amount = '') =>
    `You might not have enough ${symbol} to pay for the network transaction fee (estimated ${amount} ${symbol})`,
}

type InvestOptionProps = {
  claim: EnhancedUserClaimData
  optionIndex: number
  openModal: InvestmentFlowProps['modalCbs']['openModal']
  closeModal: InvestmentFlowProps['modalCbs']['closeModal']
}

export default function InvestOption({ claim, optionIndex, openModal, closeModal }: InvestOptionProps) {
  const { currencyAmount, price, cost: maxCost } = claim

  const { account, chainId } = useActiveWeb3React()
  const { updateInvestAmount, updateInvestError } = useClaimDispatchers()
  const { investFlowData, activeClaimAccount, estimatedGas } = useClaimState()

  const investmentAmount = investFlowData[optionIndex].investedAmount

  // Approve hooks
  const {
    approvalState: approveState,
    approve: approveCallback,
    // revokeApprove: revokeApprovalCallback, // CURRENTLY TEST ONLY
    // isPendingApproval, // CURRENTLY TEST ONLY
  } = useApproveCallbackFromClaim({
    openTransactionConfirmationModal: (message: string, operationType: OperationType) =>
      openModal(message, operationType),
    closeModals: closeModal,
    claim,
  })

  const isEtherApproveState = approveState === ApprovalState.UNKNOWN

  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()

  const [percentage, setPercentage] = useState<string>('0')
  const [typedValue, setTypedValue] = useState<string>('')
  const [inputWarning, setInputWarning] = useState<string>('')

  const investedAmount = investFlowData[optionIndex].investedAmount
  const inputError = investFlowData[optionIndex].error

  // Syntactic sugar fns for setting/resetting global state
  const setInvestedAmount = useCallback(
    (amount: string) => updateInvestAmount({ index: optionIndex, amount }),
    [optionIndex, updateInvestAmount]
  )
  const setInputError = useCallback(
    (error: string) => updateInvestError({ index: optionIndex, error }),
    [optionIndex, updateInvestError]
  )
  const resetInputError = useCallback(
    () => updateInvestError({ index: optionIndex, error: undefined }),
    [optionIndex, updateInvestError]
  )

  const token = currencyAmount?.currency
  const isNative = token?.isNative
  const balance = useCurrencyBalance(account || undefined, token)

  const gasPrice = useGasPrices(isNative ? chainId : undefined)

  const isSelfClaiming = account === activeClaimAccount
  const noBalance = !balance || balance.equalTo('0')

  const isApproved = approveState === ApprovalState.APPROVED

  const gasCost = useMemo(() => {
    if (!estimatedGas || !isNative) {
      return
    }

    // Based on how much gas will be used (estimatedGas) and current gas prices (if available)
    // calculate how much that would cost in native currency.
    // We pick `fast` to be conservative. Also, it's non-blocking, so the user is aware but can proceed
    const amount = BigNumber.from(estimatedGas).mul(gasPrice?.fast || AVG_APPROVE_COST_GWEI)

    return CurrencyAmount.fromRawAmount(token, amount.toString())
  }, [estimatedGas, gasPrice?.fast, isNative, token])

  // on invest max amount click handler
  const setMaxAmount = useCallback(() => {
    if (!maxCost || noBalance) {
      return
    }

    const value = maxCost.greaterThan(balance) ? balance : maxCost
    setTypedValue(value.toExact() || '')
  }, [balance, maxCost, noBalance])

  // Save "local" approving state (pre-BC) for rendering spinners etc
  const [approving, setApproving] = useState(false)
  const handleApprove = useCallback(async () => {
    // reset errors and close any modals
    handleCloseError()

    if (!approveCallback) return

    try {
      setApproving(true)
      const summary = `Approve ${token?.symbol || 'token'} for investing in vCOW`
      await approveCallback({ modalMessage: summary, transactionSummary: summary })
    } catch (error) {
      console.error('[InvestOption]: Issue approving.', error)
      handleSetError(error?.message)
    } finally {
      setApproving(false)
    }
  }, [approveCallback, handleCloseError, handleSetError, token?.symbol])

  /* // CURRENTLY TEST ONLY
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
    } catch (error) {
      console.error('[InvestOption]: Issue revoking approval.', error)
      handleSetError(error?.message)
    } finally {
      setApproving(false)
    }
  }, [handleCloseError, handleSetError, revokeApprovalCallback, token?.symbol])
  */

  const vCowAmount = useMemo(
    () => calculateInvestmentAmounts(claim, investmentAmount)?.vCowAmount,
    [claim, investmentAmount]
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

    if (!isSelfClaiming && !balance.lessThan(maxCost)) {
      setMaxAmount()
    }
  }, [balance, isSelfClaiming, maxCost, setMaxAmount])

  // handle input value change
  useEffect(() => {
    let error = null
    let warning

    const parsedAmount = tryParseAmount(typedValue, token)

    if (!maxCost || !balance) {
      return
    }

    // set different errors in order of importance
    if (balance.lessThan(maxCost) && !isSelfClaiming) {
      error = ErrorMsgs.InsufficientBalance(token?.symbol)
    } else if (!isNative && !isApproved) {
      error = ErrorMsgs.NotApproved(token?.symbol)
    } else if (!parsedAmount) {
      error = ErrorMsgs.InvestmentIsZero
    } else if (parsedAmount.greaterThan(maxCost)) {
      error = ErrorMsgs.OverMaxInvestment
    } else if (parsedAmount.greaterThan(balance)) {
      error = ErrorMsgs.InsufficientBalance(token?.symbol)
    } else if (isNative && gasCost && parsedAmount.add(gasCost).greaterThan(balance)) {
      warning = ErrorMsgs.InsufficientNativeBalance(token?.symbol, formatSmartLocaleAware(gasCost))
    }
    setInputWarning(warning || '')

    if (error) {
      // if there is error set it in redux
      setInputError(error)
      setPercentage('0')
    } else {
      if (!parsedAmount) {
        return
      }
      // basically the magic happens in this block

      // update redux state to remove error for this field
      resetInputError()

      // update redux state with new investAmount value
      setInvestedAmount(parsedAmount.quotient.toString())

      // update the local state with percentage value
      setPercentage(_formatPercentage(calculatePercentage(parsedAmount, maxCost)))
    }
  }, [
    balance,
    typedValue,
    isSelfClaiming,
    token,
    isNative,
    isApproved,
    maxCost,
    setInputError,
    resetInputError,
    setInvestedAmount,
    gasCost,
  ])

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
            <i title={formatMax(price)}>
              {formatSmartLocaleAware(price) || '0'} vCOW per {currencyAmount?.currency?.symbol}
            </i>
          </span>

          <span>
            <b>Max. investment available</b>{' '}
            <i title={maxCost && `${formatMax(maxCost, maxCost.currency.decimals)} ${maxCost.currency.symbol}`}>
              {formatSmartLocaleAware(maxCost, AMOUNT_PRECISION) || '0'} {maxCost?.currency?.symbol}
            </i>
          </span>

          <span>
            <b>Token approval</b>
            {!isEtherApproveState ? (
              <i>
                {approveState !== ApprovalState.APPROVED ? (
                  `${currencyAmount?.currency?.symbol} not approved`
                ) : (
                  <Row>
                    <span>{currencyAmount?.currency?.symbol} approved</span>
                    <img src={CheckCircle} alt="Approved" />
                  </Row>
                )}
              </i>
            ) : (
              <i>
                <Row>
                  <span>Approval not required!</span>
                  <img src={CheckCircle} alt="Approved" />
                </Row>
              </i>
            )}
            {/* Token Approve buton - not shown for ETH */}
            {!isEtherApproveState && approveState !== ApprovalState.APPROVED && (
              <ButtonConfirmed
                buttonSize={ButtonSize.SMALL}
                onClick={handleApprove}
                disabled={
                  approving || approveState === ApprovalState.PENDING || approveState !== ApprovalState.NOT_APPROVED
                }
                altDisabledStyle={approveState === ApprovalState.PENDING} // show solid button while waiting
              >
                {approving || approveState === ApprovalState.PENDING ? (
                  <Loader stroke="white" />
                ) : (
                  <span>Approve {currencyAmount?.currency?.symbol}</span>
                )}
              </ButtonConfirmed>
            )}
            {/*
              // CURRENTLY TEST ONLY
              approveState === ApprovalState.APPROVED && (
                <UnderlineButton disabled={approving || isPendingApproval} onClick={handleRevokeApproval}>
                  Revoke approval {approving || (isPendingApproval && <Loader size="12px" stroke="white" />)}
                </UnderlineButton>
              )
             */}
          </span>

          <span>
            <b>Available investment used</b>
            <InvestAvailableBar percentage={Number(percentage)} />
          </span>
        </InvestSummary>
        {/* Error modal */}
        <ErrorModal />
        {/* Investment inputs */}
        <InvestInput>
          <div>
            <label>
              <span>
                <b>Balance:</b>
                <i title={balance && `${formatMax(balance, balance.currency.decimals)} ${balance.currency.symbol}`}>
                  {formatSmartLocaleAware(balance, AMOUNT_PRECISION) || 0} {balance?.currency?.symbol}
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
                onUserInput={setTypedValue}
                disabled={noBalance || !isSelfClaiming}
                placeholder="0"
                $loading={false}
                value={typedValue}
              />
              <b>{currencyAmount?.currency?.symbol}</b>
            </label>
            <i title={vCowAmount && `${formatMax(vCowAmount, vCowAmount.currency.decimals)} vCOW`}>
              Receive: {formatSmartLocaleAware(vCowAmount, AMOUNT_PRECISION) || 0} vCOW
            </i>
            {/* Insufficient balance validation error */}
            {inputError && <small>{inputError}</small>}
            {inputWarning && <small className="warn">{inputWarning}</small>}
          </div>
        </InvestInput>
      </span>
    </InvestTokenGroup>
  )
}

function _formatPercentage(percentage: Percent): string {
  return formatSmartLocaleAware(percentage, PERCENTAGE_PRECISION) || '0'
}
