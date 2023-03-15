import { TwapOrder } from './hooks'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { TokenLogo } from '@cow/pages/Claim/styled'
import CurrencyLogo from '@src/components/CurrencyLogo'
import { ExplorerLink } from '@src/custom/components/ExplorerLink'
import styled from 'styled-components/macro'
import useTimeAgo from '@src/custom/hooks/useTimeAgo'

const TIME_AGO_UPDATE_INTERVAL = 3000

interface TwapOrderRowProps {
  order: TwapOrder
}

const Wrapper = styled.div``
const Field = styled.div`
  margin: 1rem 0;
`

function getState(props: { hasStarted: boolean; isExpired: boolean }) {
  const { hasStarted, isExpired } = props

  if (!hasStarted) {
    return '🕣 SCHEDULED'
  }

  if (isExpired) {
    return '🦖 EXPIRED'
  }

  return '🏃‍♀️ RUNNING'
}

export function TwapOrderRow({ order }: TwapOrderRowProps) {
  const {
    sellToken,
    buyToken,
    startDate,
    endDate,
    numberParts,
    frequencySeconds,
    partSellAmount,
    partValiditySeconds,
    receiver,
    totalSellAmount,
  } = order

  const startDateTimeAgo = useTimeAgo(startDate, TIME_AGO_UPDATE_INTERVAL)
  const endDateTimeAgo = useTimeAgo(endDate, TIME_AGO_UPDATE_INTERVAL)
  const hasStarted = startDate.getTime() < Date.now()
  const isExpired = endDate.getTime() <= Date.now()
  const state = getState({ hasStarted, isExpired })
  return (
    <Wrapper>
      <Field>
        <strong>STATE</strong> {state}
      </Field>
      <Field>
        <TokenLogo symbol={sellToken.symbol || sellToken.address} size={0} /> <strong>Sell</strong>{' '}
        <CurrencyLogo currency={sellToken} size="28px" />{' '}
        <TokenAmount amount={totalSellAmount} tokenSymbol={sellToken} />
      </Field>
      <Field>
        <strong>Buy</strong> <CurrencyLogo currency={buyToken} size="28px" /> {buyToken.symbol}
      </Field>
      <Field>
        <strong>Start Date</strong>{' '}
        <span>
          {startDate.toISOString()} ({startDateTimeAgo})
        </span>
      </Field>
      <Field>
        <strong>Expiration Date</strong>{' '}
        <span>
          {endDate.toISOString()} ({endDateTimeAgo})
        </span>
      </Field>
      <Field>
        <strong>Total Executions</strong> {numberParts}
      </Field>
      <Field>
        <strong>Sell by Execution</strong> <TokenAmount amount={partSellAmount} tokenSymbol={sellToken} />
      </Field>
      <Field>
        <strong>Delay between Executions</strong>: {frequencySeconds / 60} minutes
      </Field>
      <Field>
        <strong>Validity by Execution</strong> {partValiditySeconds / 60} min
      </Field>
      <Field>
        <strong>Receiver</strong> <ExplorerLink id={receiver} type={'address'} label={receiver} />
      </Field>
      <hr />
    </Wrapper>
  )
}
