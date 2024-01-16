import { UI } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

const StatusList = styled.ol`
  display: flex;
  flex-flow: row wrap;
  list-style: none;
  font-size: 12px;
  font-weight: 400;
  gap: 5px;
  padding: 0;

  > li {
    display: flex;
    gap: 5px;
    align-items: center;
    width: 100%;
  }
`

const LOWER_PERCENTAGE_DIFFERENCE = new Percent(5, 1000) // 0.5%
const UPPER_PERCENTAGE_DIFFERENCE = new Percent(5, 100) // 5%
export type OrderExecutionStatus = 'notClose' | 'close' | 'veryClose'

export function calculateOrderExecutionStatus(difference: Percent | undefined): OrderExecutionStatus | undefined {
  if (!difference) {
    return undefined
  }

  if (difference.lessThan(LOWER_PERCENTAGE_DIFFERENCE)) {
    return 'veryClose'
  } else if (difference.greaterThan(UPPER_PERCENTAGE_DIFFERENCE)) {
    return 'notClose'
  } else {
    return 'close'
  }
}

export const ExecuteIndicator = styled.div<{ status?: OrderExecutionStatus }>`
  --size: 6px;
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  min-height: var(--size);
  border-radius: var(--size);
  display: block;
  margin: 0 3px 0 0;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'veryClose':
        return theme.success
      case 'close':
        return theme.text3
      case 'notClose':
      default:
        return `var(${UI.COLOR_TEXT})`
    }
  }};
`

export function OrderExecutionStatusList() {
  return (
    <StatusList>
      <li>
        <ExecuteIndicator status={'veryClose'} /> <b>Very close</b> (&lt;0.5% from market price)
      </li>
      <li>
        <ExecuteIndicator status={'close'} /> <b>Close</b> (0.5% - 5% from market price)
      </li>
      <li>
        <ExecuteIndicator status={'notClose'} /> <b>Not yet close</b> (&gt;5% from market price)
      </li>
    </StatusList>
  )
}
export { RateTooltipHeader } from './RateTooltipHeader'
