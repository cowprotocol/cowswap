import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { InvestTokenGroup, TokenLogo, InvestSummary, InvestInput } from '../styled'
import { formatSmart } from 'utils/format'
import Row from 'components/Row'
import { CheckCircle } from 'react-feather'
import { InvestOptionProps } from '.'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/web3'

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
  color: blue;
  padding: 0;
`

const INVESTMENT_STEPS = [0, 25, 50, 75, 100]

export default function InvestOption({ approveData, updateInvestAmount, claim }: InvestOptionProps) {
  const { currencyAmount, price, cost: maxCost, investedAmount } = claim

  const { account } = useActiveWeb3React()

  const token = currencyAmount?.currency

  const balance = useCurrencyBalance(account || undefined, token)

  const handlePercentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
  }

  const handleStepChange = (value: number) => {
    console.log(value)
  }

  const onMaxClick = useCallback(() => {
    if (!maxCost || !balance) {
      return
    }

    const amount = maxCost.greaterThan(balance) ? balance : maxCost
    // store the value as a string to prevent unnecessary re-renders
    const investAmount = formatUnits(amount.quotient.toString(), balance.currency.decimals)

    updateInvestAmount(claim.index, investAmount)
  }, [balance, claim.index, maxCost, updateInvestAmount])

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
    if (!token || !price) {
      return
    }

    const investA = CurrencyAmount.fromRawAmount(token, parseUnits(investedAmount, token.decimals).toString())
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

              <input
                style={{ width: '100%' }}
                onChange={handlePercentChange}
                type="range"
                min="0"
                max="100"
                value={0}
              />
            </div>
          </span>
        </InvestSummary>
        <InvestInput>
          <div>
            <span>
              <b>Balance:</b>{' '}
              <i>
                {formatSmart(balance)} {currencyAmount?.currency?.symbol}
              </i>
              {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
              <button onClick={onMaxClick}>Invest max. possible</button>
            </span>
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
