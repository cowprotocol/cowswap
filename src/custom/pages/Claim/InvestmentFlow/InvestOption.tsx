import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { InvestTokenGroup, TokenLogo, InvestSummary, InvestInput, InvestAvailableBar } from '../styled'
import { formatSmart } from 'utils/format'
import Row from 'components/Row'
import { CheckCircle } from 'react-feather'
import { InvestOptionProps } from '.'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'

import { ButtonConfirmed } from 'components/Button'
import { ButtonSize } from 'theme'
import Loader from 'components/Loader'

const RangeSteps = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`

const RangeStep = styled.button`
  background: none;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  padding: 0;
`

const InvestBalance = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const InvestMaxBalance = styled.button`
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  background: none;
  border: none;
`

const INVESTMENT_STEPS = [0, 25, 50, 75, 100]

export default function InvestOption({ approveData, claim, optionIndex }: InvestOptionProps) {
  const { currencyAmount, price, cost: maxCost } = claim
  const { updateInvestAmount } = useClaimDispatchers()
  const { investFlowData } = useClaimState()

  const investedAmount = useMemo(() => investFlowData[optionIndex].investedAmount, [investFlowData, optionIndex])

  const [percentage, setPercentage] = useState<number>(0)

  const { account } = useActiveWeb3React()

  const token = currencyAmount?.currency

  const balance = useCurrencyBalance(account || undefined, token)

  const decimals = balance?.currency?.decimals

  const scaleValue = useCallback(
    (maxValue: string, value: number) => {
      if (value === 0) {
        return parseUnits('0', decimals)
      }

      // parse percent to string, example 25% -> 4 or 50% -> 2
      const parsedValue = parseUnits((100 / value).toFixed(decimals), decimals)

      // parse maxValue to string
      const parsedMaxValue = parseUnits(maxValue, decimals)

      // divide parsedMax with parsed value to get invest amount
      return parsedMaxValue.div(parsedValue).toString()
    },
    [decimals]
  )

  const handleStepChange = useCallback(
    (value: number) => {
      if (!maxCost || !balance) {
        return
      }

      const scaled = scaleValue(maxCost.quotient.toString(), value)
      const amount = formatUnits(scaled, decimals)

      updateInvestAmount({ index: optionIndex, amount })
      setPercentage(value)
    },
    [balance, decimals, maxCost, optionIndex, scaleValue, updateInvestAmount]
  )

  const onMaxClick = useCallback(() => {
    if (!maxCost || !balance) {
      return
    }

    const amount = maxCost.greaterThan(balance) ? balance : maxCost
    // store the value as a string to prevent unnecessary re-renders
    const investAmount = formatUnits(amount.quotient.toString(), decimals)

    updateInvestAmount({ index: optionIndex, amount: investAmount })
    setPercentage(100)
  }, [balance, decimals, maxCost, optionIndex, updateInvestAmount])

  // Cache approveData methods
  const approveCallback = approveData?.approveCallback
  const approveState = approveData?.approveState
  // Save "local" approving state (pre-BC) for rendering spinners etc
  const [approving, setApproving] = useState(false)
  const handleApprove = useCallback(async () => {
    if (!approveCallback) return

    try {
      // for pending state pre-BC
      setApproving(true)
      await approveCallback({ transactionSummary: `Approve ${token?.symbol || 'token'} for investing in vCOW` })
    } catch (error) {
      console.error('[InvestOption]: Issue approving.', error)
    } finally {
      setApproving(false)
    }
  }, [approveCallback, token?.symbol])

  const vCowAmount = useMemo(() => {
    if (!token || !price || !investedAmount) {
      return
    }

    const parsedA = parseUnits(investedAmount, token.decimals).toString()
    const investA = CurrencyAmount.fromRawAmount(token, parsedA)
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

            <div>
              <RangeSteps>
                {INVESTMENT_STEPS.map((step: number) => (
                  <RangeStep onClick={() => handleStepChange(step)} key={step}>
                    {step}%
                  </RangeStep>
                ))}
              </RangeSteps>

              <InvestAvailableBar percentage={percentage} />
            </div>
          </span>
        </InvestSummary>
        <InvestInput>
          <div>
            <InvestBalance>
              <div>
                <b>Balance:</b>{' '}
                <i>
                  {formatSmart(balance)} {currencyAmount?.currency?.symbol}
                </i>
              </div>
              {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
              <InvestMaxBalance onClick={onMaxClick}>Invest max. possible</InvestMaxBalance>
            </InvestBalance>
            <label>
              <b>{currencyAmount?.currency?.symbol}</b>
              <input disabled placeholder="0" value={investedAmount} max={formatSmart(currencyAmount)} />
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
