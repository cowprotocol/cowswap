import ShieldImage from '@cowprotocol/assets/cow-swap/protection.svg'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { deadlinePartsDisplay } from 'modules/twap/utils/deadlinePartsDisplay'

const IconImage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > svg {
    fill: currentColor;
    margin: 0 3px 0 0;
  }
`

export interface LabelTooltip {
  label: React.ReactNode
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tooltip?: React.ReactNode | ((params: any) => React.ReactNode)
}

export interface LabelTooltipItems {
  [key: string]: LabelTooltip
}

export const LABELS_TOOLTIPS: LabelTooltipItems = {
  numberOfParts: {
    label: 'No. of parts',
    tooltip: 'Your TWAP order will be split into this many parts, which will execute one by one.',
  },
  totalDuration: {
    label: 'Total duration',
    tooltip: ({ parts, partDuration }: { parts: number; partDuration: number }) => (
      <>
        {/* TODO: Add time units */}
        The "Total duration" is the duration it takes to execute all parts of your TWAP order.
        <br />
        <br />
        For instance, your order consists of <b>{parts} parts</b> placed every{' '}
        <b>{deadlinePartsDisplay(partDuration)}</b>, the total time to complete the order is{' '}
        <b>{deadlinePartsDisplay(parts * partDuration)}</b>. Each limit order remains open for{' '}
        <b>{deadlinePartsDisplay(partDuration)}</b> until the next part becomes active.
      </>
    ),
  },
  partDuration: {
    label: 'Part duration',
    tooltip: (
      <>
        The "Part duration" refers to the duration between each part of your TWAP order.
        <br />
        <br />
        Choosing a shorter time allows for faster execution of each part, potentially reducing price fluctuations.
        Striking the right balance is crucial for optimal execution.
      </>
    ),
  },
  slippage: {
    label: (
      <>
        <IconImage>
          <SVG src={ShieldImage} width="16" height="16" title="Price protection" />
        </IconImage>{' '}
        Price protection
      </>
    ),
    tooltip: (
      <>Your TWAP order won't execute and is protected if the market price dips more than your set price protection.</>
    ),
  },
  price: {
    label: 'Rate',
    tooltip: 'This is the current market price, including the fee.',
  },
  sellAmount: {
    label: 'Sell per part',
    tooltip: 'Estimated amount that will be sold in each part of the order.',
  },
  buyAmount: {
    label: 'Buy per part',
    tooltip: 'Estimated amount that you will receive from each part of the order.',
  },
  startTime: {
    label: 'Start time',
    tooltip: 'The order will start when it is validated and executed in your Safe.',
  },
}

export const AMOUNT_PARTS_LABELS = {
  sellAmount: LABELS_TOOLTIPS.sellAmount,
  buyAmount: LABELS_TOOLTIPS.buyAmount,
}
