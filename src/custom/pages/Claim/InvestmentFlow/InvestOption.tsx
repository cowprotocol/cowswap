import { useCallback, useMemo, useState, useEffect } from 'react'

import CowProtocolLogo from 'components/CowProtocolLogo'
import { InvestTokenGroup, TokenLogo, InvestSummary, InvestInput, InvestAvailableBar } from '../styled'
import { formatSmart } from 'utils/format'
import Row from 'components/Row'
import CheckCircle from 'assets/cow-swap/check.svg'
import { InvestmentFlowProps } from '.'
import { ApprovalState, useApproveCallbackFromClaim } from 'hooks/useApproveCallback'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { ClaimType, useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import { StyledNumericalInput } from 'components/CurrencyInputPanel/CurrencyInputPanelMod'

import { ButtonConfirmed } from 'components/Button'
import { ButtonSize } from 'theme'
import Loader from 'components/Loader'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import { tryParseAmount } from 'state/swap/hooks'
import { calculateInvestmentAmounts, calculatePercentage } from 'state/claim/hooks/utils'
import { EnhancedUserClaimData } from '../types'
import { OperationType } from 'components/TransactionConfirmationModal'

enum ErrorMsgs {
  InsufficientBalance = 'Insufficient balance to cover investment amount',
  OverMaxInvestment = `Your investment amount can't be above the maximum investment allowed`,
}

type InvestOptionProps = {
  claim: EnhancedUserClaimData
  optionIndex: number
  openModal: InvestmentFlowProps['modalCbs']['openModal']
  closeModal: InvestmentFlowProps['modalCbs']['closeModal']
}

const _claimApproveMessageMap = (type: ClaimType) => {
  switch (type) {
    case ClaimType.GnoOption:
      return 'Approving GNO for investing in vCOW'
    case ClaimType.Investor:
      return 'Approving USDC for investing in vCOW'
    // Shouldn't happen, type safe
    default:
      return 'Unknown token approval. Please check configuration.'
  }
}

export default function InvestOption({ claim, optionIndex, openModal, closeModal }: InvestOptionProps) {
  const { currencyAmount, price, cost: maxCost } = claim

  const { account } = useActiveWeb3React()
  const { updateInvestAmount } = useClaimDispatchers()
  const { investFlowData, activeClaimAccount } = useClaimState()

  const investmentAmount = investFlowData[optionIndex].investedAmount

  // Approve hooks
  const [approveState, approveCallback] = useApproveCallbackFromClaim({
    openTransactionConfirmationModal: () => openModal(_claimApproveMessageMap(claim.type), OperationType.APPROVE_TOKEN),
    closeModals: closeModal,
    claimType: claim.type,
    investmentAmount,
  })

  const isEtherApproveState = approveState === ApprovalState.UNKNOWN

  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()

  const [percentage, setPercentage] = useState<string>('0')
  const [typedValue, setTypedValue] = useState<string>('0')
  const [inputError, setInputError] = useState<string>('')

  const token = currencyAmount?.currency
  const balance = useCurrencyBalance(account || undefined, token)

  const isSelfClaiming = account === activeClaimAccount
  const noBalance = !balance || balance.equalTo('0')

  // on invest max amount click handler
  const setMaxAmount = useCallback(() => {
    if (!maxCost || noBalance) {
      return
    }

    const value = maxCost.greaterThan(balance) ? balance : maxCost
    const amount = value.quotient.toString()

    updateInvestAmount({ index: optionIndex, amount })
    setTypedValue(value.toExact() || '')
    setInputError('')

    setPercentage(calculatePercentage(balance, maxCost))
  }, [balance, maxCost, noBalance, optionIndex, updateInvestAmount])

  // on input field change handler
  const onInputChange = useCallback(
    (value: string) => {
      setTypedValue(value)
      setInputError('')

      // parse to CurrencyAmount
      const parsedAmount = tryParseAmount(value, token)

      // no amount/necessary params, return 0
      if (!parsedAmount || !maxCost || !balance || !token) {
        updateInvestAmount({ index: optionIndex, amount: '0' })
        setPercentage('0')
        return
      }

      let errorMsg = null

      if (parsedAmount.greaterThan(maxCost)) errorMsg = ErrorMsgs.OverMaxInvestment
      else if (parsedAmount.greaterThan(balance)) errorMsg = ErrorMsgs.InsufficientBalance

      if (errorMsg) {
        setInputError(errorMsg)
        updateInvestAmount({ index: optionIndex, amount: '0' })
        setPercentage('0')
        return
      }

      // update redux state with new investAmount value
      updateInvestAmount({ index: optionIndex, amount: parsedAmount.quotient.toString() })

      // update the local state with percentage value
      setPercentage(calculatePercentage(parsedAmount, maxCost))
    },
    [balance, maxCost, optionIndex, token, updateInvestAmount]
  )

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
    () => calculateInvestmentAmounts(claim, investmentAmount)?.vCowAmount,
    [claim, investmentAmount]
  )

  // if its claiming for someone else we will set values to max
  // if there is not enough balance then we will set an error
  useEffect(() => {
    if (!isSelfClaiming) {
      if (!balance || !maxCost) {
        return
      }

      if (balance.lessThan(maxCost)) {
        setInputError(ErrorMsgs.InsufficientBalance)
      } else {
        setMaxAmount()
      }
    }
  }, [balance, isSelfClaiming, maxCost, setMaxAmount])

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
              {formatSmart(price)} vCoW per {currencyAmount?.currency?.symbol}
            </i>
          </span>

          <span>
            <b>Max. investment available</b>{' '}
            <i>
              {maxCost?.toExact() || '0'} {currencyAmount?.currency?.symbol}
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
                  {formatSmart(balance) || 0} {currencyAmount?.currency?.symbol}
                </i>
                {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
                {!noBalance && isSelfClaiming && (
                  <button disabled={!isSelfClaiming} onClick={setMaxAmount}>
                    (invest max. possible)
                  </button>
                )}
              </span>
              <StyledNumericalInput
                onUserInput={onInputChange}
                disabled={noBalance || !isSelfClaiming}
                placeholder="0"
                $loading={false}
                value={typedValue}
              />
              <b>{currencyAmount?.currency?.symbol}</b>
            </label>
            <i>Receive: {formatSmart(vCowAmount) || 0} vCOW</i>
            {/* Insufficient balance validation error */}
            {inputError ? <small>{inputError}</small> : ''}
          </div>
        </InvestInput>
      </span>
    </InvestTokenGroup>
  )
}
