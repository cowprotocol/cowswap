import { useCallback, useMemo, useState, useEffect } from 'react'
import { Percent } from '@uniswap/sdk-core'

import CowProtocolLogo from 'components/CowProtocolLogo'
import { InvestTokenGroup, TokenLogo, InvestSummary, InvestInput, InvestAvailableBar } from '../styled'
import { formatSmartLocaleAware } from 'utils/format'
import Row from 'components/Row'
import CheckCircle from 'assets/cow-swap/check.svg'
import { InvestOptionProps } from '.'
import { ApprovalState } from 'hooks/useApproveCallback'
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
import { _estimateTxCost } from 'components/swap/EthWethWrap/helpers'
import { useWalletInfo } from 'hooks/useWalletInfo'

const ErrorMsgs = {
  InsufficientBalance: (symbol = '') => `Insufficient ${symbol} balance to cover investment amount`,
  OverMaxInvestment: `Your investment amount can't be above the maximum investment allowed`,
  InvestmentIsZero: `Your investment amount can't be zero`,
  NotApproved: (symbol = '') => `Please approve ${symbol} token`,
  InsufficientNativeBalance: (symbol = '', action = "won't") =>
    `You ${action} have enough ${symbol} to pay the network transaction fee`,
}

export default function InvestOption({ approveData, claim, optionIndex }: InvestOptionProps) {
  const { currencyAmount, price, cost: maxCost } = claim
  const { updateInvestAmount, updateInvestError } = useClaimDispatchers()
  const { investFlowData, activeClaimAccount } = useClaimState()

  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()

  const { account, chainId } = useActiveWeb3React()
  const { isSmartContractWallet } = useWalletInfo()

  const [percentage, setPercentage] = useState<string>('0')
  const [typedValue, setTypedValue] = useState<string>('0')
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
  const balance = useCurrencyBalance(account || undefined, token)

  const gasPrice = useGasPrices(chainId)
  const { singleTxCost } = useMemo(
    () => _estimateTxCost(gasPrice, token?.isNative ? token : undefined),
    [gasPrice, token]
  )

  const isSelfClaiming = account === activeClaimAccount
  const noBalance = !balance || balance.equalTo('0')

  const isApproved = approveData?.approveState === ApprovalState.APPROVED
  const isNative = token?.isNative

  // on invest max amount click handler
  const setMaxAmount = useCallback(() => {
    if (!maxCost || noBalance) {
      return
    }

    const value = maxCost.greaterThan(balance) ? balance : maxCost
    setTypedValue(value.toExact() || '')
  }, [balance, maxCost, noBalance])

  // Cache approveData methods
  const approveCallback = approveData?.approveCallback
  const approveState = approveData?.approveState
  // Save "local" approving state (pre-BC) for rendering spinners etc
  const [approving, setApproving] = useState(false)
  const handleApprove = useCallback(async () => {
    // reset errors and close any modals
    handleCloseError()

    if (!approveCallback) return

    try {
      // for pending state pre-BC
      setApproving(true)
      await approveCallback({ transactionSummary: `Approve ${token?.symbol || 'token'} for investing in vCOW` })
    } catch (error) {
      console.error('[InvestOption]: Issue approving.', error)
      handleSetError(error?.message)
    } finally {
      setApproving(false)
    }
  }, [approveCallback, handleCloseError, handleSetError, token?.symbol])

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
    } else if (isNative && parsedAmount && singleTxCost?.add(parsedAmount).greaterThan(balance)) {
      if (isSmartContractWallet) {
        warning = ErrorMsgs.InsufficientNativeBalance(token?.symbol, 'might not')
      } else {
        error = ErrorMsgs.InsufficientNativeBalance(token?.symbol)
      }
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
    isSmartContractWallet,
    singleTxCost,
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
            <i>
              {formatSmartLocaleAware(price) || '0'} vCoW per {currencyAmount?.currency?.symbol}
            </i>
          </span>

          <span>
            <b>Max. investment available</b>{' '}
            <i>
              {formatSmartLocaleAware(maxCost, AMOUNT_PRECISION) || '0'} {currencyAmount?.currency?.symbol}
            </i>
          </span>

          <span>
            <b>Token approval</b>
            {approveData ? (
              <i>
                {approveData.approveState !== ApprovalState.APPROVED ? (
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
            {/* Approve button - @biocom styles for this found in ./styled > InputSummary > ${ButtonPrimary}*/}
            {approveData && approveState !== ApprovalState.APPROVED && (
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
                ) : approveData ? (
                  <span>Approve {currencyAmount?.currency?.symbol}</span>
                ) : null}
              </ButtonConfirmed>
            )}
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
                <i>
                  {formatSmartLocaleAware(balance, AMOUNT_PRECISION) || 0} {currencyAmount?.currency?.symbol}
                </i>
                {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
                {!noBalance && isSelfClaiming && (
                  <button disabled={!isSelfClaiming} onClick={setMaxAmount}>
                    (invest max. possible)
                  </button>
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
            <i>Receive: {formatSmartLocaleAware(vCowAmount, AMOUNT_PRECISION) || 0} vCOW</i>
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
