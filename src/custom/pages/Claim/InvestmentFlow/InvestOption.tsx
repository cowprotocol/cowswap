import { useCallback, useMemo, useState, useEffect } from 'react'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { BigNumber } from '@ethersproject/bignumber'
import SVG from 'react-inlinesvg'

import CowProtocolLogo from 'components/CowProtocolLogo'
import {
  InvestTokenGroup,
  TokenLogo,
  InvestSummary,
  InvestInput,
  InvestAvailableBar,
  UnderlineButton,
  UserMessage,
  WarningWrapper,
} from '../styled'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import Row from 'components/Row'
import CheckCircle from 'assets/cow-swap/check.svg'
import ImportantIcon from 'assets/cow-swap/important.svg'
import { ApprovalState, useApproveCallbackFromClaim } from 'hooks/useApproveCallback'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import { StyledNumericalInput } from 'components/CurrencyInputPanel/CurrencyInputPanelMod'

import { ButtonConfirmed } from 'components/Button'
import { ButtonSize } from 'theme'
import Loader from 'components/Loader'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { calculateInvestmentAmounts, calculatePercentage } from 'state/claim/hooks/utils'
import { AMOUNT_PRECISION, PERCENTAGE_PRECISION } from 'constants/index'
import { useGasPrices } from 'state/gas/hooks'
import { AVG_APPROVE_COST_GWEI } from 'components/swap/EthWethWrap/helpers'
import { EnhancedUserClaimData } from '../types'
import { OperationType } from 'components/TransactionConfirmationModal'
import { ONE_HUNDRED_PERCENT } from 'constants/misc'
import { IS_TESTING_ENV } from '../const'
import { InvestmentFlowProps } from '.'

const ErrorMessages = {
  NoBalance: (symbol = '') =>
    `You don't have ${symbol} balance to invest. Add sufficient ${symbol} balance or go back and uncheck ${symbol} as an investment option.`,

  InsufficientBalanceSelf: (symbol = '') => `Insufficient ${symbol} balance to cover investment amount`,
  InsufficientBalanceBehalf: (symbol = '') =>
    `Your ${symbol} balance is not enough to cover 100% of the investment amount.`,

  OverMaxInvestment: `Your investment amount can not be above the maximum investment allowed`,
  InvestmentIsZero: `Your investment amount can not be zero`,
  NotApproved: (symbol = '') => `Please approve ${symbol} token`,
  WaitForApproval: (symbol = '') => `Approving ${symbol}. Please wait until the transaction is mined.`,
}

const WarningMessages = {
  InsufficientNativeBalance: (symbol = '', amount = '') =>
    `You might not have enough ${symbol} to pay for the network transaction fee (estimated ${amount} ${symbol})`,
  NotMaxInvested: `Please note: after executing the transaction in the last step, you will not be able to invest anymore.`,
}

type InvestOptionProps = {
  claim: EnhancedUserClaimData
  openModal: InvestmentFlowProps['modalCbs']['openModal']
  closeModal: InvestmentFlowProps['modalCbs']['closeModal']
}

export default function InvestOption({ claim, openModal, closeModal }: InvestOptionProps) {
  const { currencyAmount, price, cost: maxCost, index } = claim

  const { account, chainId } = useActiveWeb3React()
  const { updateInvestAmount, updateInvestError, setIsTouched } = useClaimDispatchers()
  const { investFlowData, activeClaimAccount, estimatedGas } = useClaimState()

  // Approve hooks
  const {
    approvalState: approveState,
    approve: approveCallback,
    revokeApprove: revokeApprovalCallback, // CURRENTLY TEST ONLY (not on prod, barn or ens)
    isPendingApproval: isPendingRevoke, // CURRENTLY TEST ONLY (not on prod, barn or ens)
  } = useApproveCallbackFromClaim({
    openTransactionConfirmationModal: (message: string, operationType: OperationType) =>
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
    } catch (error) {
      console.error('[InvestOption]: Issue approving.', error)
      handleSetError(error?.message)
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
    } catch (error) {
      console.error('[InvestOption]: Issue revoking approval.', error)
      handleSetError(error?.message)
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
      percentageValue = _formatPercentage(calculatePercentage(parsedAmount, maxCost))
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
      warnings.push(WarningMessages.InsufficientNativeBalance(token?.symbol, formatSmartLocaleAware(gasCost)))
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
                <i
                  title={
                    balance && `${formatMax(balance, balance.currency.decimals)} ${currencyAmount?.currency?.symbol}`
                  }
                >
                  {formatSmartLocaleAware(balance, AMOUNT_PRECISION) || 0} {currencyAmount?.currency?.symbol}
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
            <i title={vCowAmount && `${formatMax(vCowAmount, vCowAmount.currency.decimals)} vCOW`}>
              Receive: {formatSmartLocaleAware(vCowAmount, AMOUNT_PRECISION) || 0} vCOW
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

function _formatPercentage(percentage: Percent): string {
  return formatSmartLocaleAware(percentage, PERCENTAGE_PRECISION) || '0'
}
