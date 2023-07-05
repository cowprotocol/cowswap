import { deadlinePartsDisplay } from 'modules/twap/utils/deadlinePartsDisplay'

export interface LabelTooltip {
  label: string
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
    label: 'Slippage',
    tooltip: (
      <>
        This slippage will apply to each part of your order. Since a TWAP order executes over a longer period of time,
        your slippage should take into account possible price fluctuations over that time.
        <br />
        <br />
        If your slippage is too low, you risk some parts of your order failing to execute.
      </>
    ),
  },
  price: {
    label: 'Current market price',
    tooltip: 'This is the current market price',
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
