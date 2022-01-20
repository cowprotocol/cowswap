import { useCallback, useMemo, useState } from 'react'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatUnits } from '@ethersproject/units'
import {
  // Currency,
  CurrencyAmount,
  // Fraction
} from '@uniswap/sdk-core'

import { InvestTokenGroup, TokenLogo, InvestSummary, InvestInput, InvestAvailableBar } from '../styled'
import { formatSmart } from 'utils/format'
import Row from 'components/Row'
import CheckCircle from 'assets/cow-swap/check.svg'
import { InvestOptionProps } from '.'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'

import { ButtonConfirmed } from 'components/Button'
import { ButtonSize } from 'theme'
import Loader from 'components/Loader'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'

const INVESTMENT_STEPS = ['0', '25', '50', '75', '100']

// function _scaleValue(maxValue: CurrencyAmount<Currency>, value: string) {
//   // parse percent to string, example 25% -> 4 or 50% -> 2
//   const parsedValue = new Fraction(value, '100')

//   // divide maxValue with parsed value to get invest amount
//   return maxValue.multiply(parsedValue).asFraction
// }

export default function InvestOption({ approveData, claim, optionIndex }: InvestOptionProps) {
  const { currencyAmount, price, cost: maxCost } = claim
  const { updateInvestAmount } = useClaimDispatchers()
  const { investFlowData } = useClaimState()

  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()

  const investedAmount = useMemo(() => investFlowData[optionIndex].investedAmount, [investFlowData, optionIndex])

  const [percentage, setPercentage] = useState<string>(INVESTMENT_STEPS[0])

  const { account } = useActiveWeb3React()

  const token = currencyAmount?.currency
  const decimals = token?.decimals
  const balance = useCurrencyBalance(account || undefined, token)

  // const handleStepChange = useCallback(
  //   (value: string) => {
  //     if (!maxCost || !balance) {
  //       return
  //     }

  //     const scaledCurrencyAmount = _scaleValue(maxCost, value)

  //     updateInvestAmount({ index: optionIndex, amount: scaledCurrencyAmount.quotient.toString() })
  //     setPercentage(value)
  //   },
  //   [balance, maxCost, optionIndex, updateInvestAmount]
  // )

  const onMaxClick = useCallback(() => {
    if (!maxCost || !balance) {
      return
    }

    const amount = maxCost.greaterThan(balance) ? balance : maxCost

    updateInvestAmount({ index: optionIndex, amount: amount.quotient.toString() })
    setPercentage(INVESTMENT_STEPS[INVESTMENT_STEPS.length - 1])
  }, [balance, maxCost, optionIndex, updateInvestAmount])

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

  const vCowAmount = useMemo(() => {
    if (!token || !price || !investedAmount) {
      return
    }

    const investA = CurrencyAmount.fromRawAmount(token, investedAmount)
    return investA.multiply(price)
  }, [investedAmount, price, token])

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
              {formatSmart(maxCost) || '0'} {currencyAmount?.currency?.symbol}
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
                  {formatSmart(balance) || 0} {currencyAmount?.currency?.symbol}
                </i>
                {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
                <button onClick={onMaxClick}>(invest max possible)</button>
              </span>
              <input
                // disabled
                placeholder="0"
                value={investedAmount ? formatUnits(investedAmount, decimals) : '0'}
                max={formatSmart(currencyAmount)}
              />
              <b>{currencyAmount?.currency?.symbol}</b>
            </label>
            <i>Receive: {formatSmart(vCowAmount) || 0} vCOW</i>
            {/* Insufficient balance validation error */}
            <small>
              Insufficient balance to invest. Adjust the amount or go back to remove this investment option.
            </small>
          </div>
        </InvestInput>
      </span>
    </InvestTokenGroup>
  )
}
