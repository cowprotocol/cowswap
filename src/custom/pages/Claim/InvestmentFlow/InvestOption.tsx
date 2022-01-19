import { useCallback, useMemo, useState, useEffect } from 'react'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { InvestTokenGroup, TokenLogo, InvestSummary, InvestInput, InvestAvailableBar } from '../styled'
import { formatSmart } from 'utils/format'
import Row from 'components/Row'
import { CheckCircle } from 'react-feather'
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
import { ZERO_PERCENT } from 'constants/misc'
import { PERCENTAGE_PRECISION } from 'constants/index'

enum ErrorMsgs {
  Balance = 'Insufficient balance to cover input investment amount. Adjust the amount or go back to remove this investment option',
  Input = 'Input amount is bigger than available investment amount',
}

export default function InvestOption({ approveData, claim, optionIndex }: InvestOptionProps) {
  const { currencyAmount, price, cost: maxCost } = claim
  const { updateInvestAmount } = useClaimDispatchers()
  const { investFlowData, activeClaimAccount } = useClaimState()

  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()

  const { account } = useActiveWeb3React()

  const [percentage, setPercentage] = useState<string>('0')
  const [typedValue, setTypedValue] = useState<string>('0')
  const [inputError, setInputError] = useState<string>('')

  const investedAmount = investFlowData[optionIndex].investedAmount

  const token = currencyAmount?.currency
  const decimals = token?.decimals
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
    setTypedValue(formatSmart(value, decimals, { smallLimit: undefined }) || '')
    setPercentage('100')
  }, [balance, decimals, maxCost, noBalance, optionIndex, updateInvestAmount])

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

      // calculate percent
      const maxValue = maxCost.greaterThan(balance) ? balance : maxCost
      const percent = maxValue.equalTo(ZERO_PERCENT)
        ? ZERO_PERCENT
        : new Percent(parsedAmount.quotient, maxValue.quotient)

      if (parsedAmount.greaterThan(maxValue)) {
        setInputError(ErrorMsgs.Input)
        updateInvestAmount({ index: optionIndex, amount: '0' })
        setPercentage('0')
        return
      }

      // update redux state with new investAmount value
      updateInvestAmount({ index: optionIndex, amount: parsedAmount.quotient.toString() })

      // update the local state with percent value
      setPercentage(formatSmart(percent, PERCENTAGE_PRECISION) || '0')
    },
    [balance, maxCost, optionIndex, token, updateInvestAmount]
  )

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
    return price.quote(investA)
  }, [investedAmount, price, token])

  // if its claiming for someone else we will set values to max
  // if there is not enough balance then we will set an error
  useEffect(() => {
    if (!isSelfClaiming) {
      if (!balance || !maxCost) {
        return
      }

      if (balance.lessThan(maxCost)) {
        setInputError(ErrorMsgs.Balance)
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
                    {currencyAmount?.currency?.symbol} approved{' '}
                    <CheckCircle color="lightgreen" style={{ marginLeft: 5 }} />
                  </Row>
                )}
              </i>
            ) : (
              <i>
                <Row>
                  Approval not required! <CheckCircle color="lightgreen" style={{ marginLeft: 5 }} />
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
            <label>
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
