export interface LabelTooltipObject {
  label: string
  tooltip?: JSX.Element
}

export interface LabelTooltipItems {
  [key: string]: LabelTooltipObject
}

export const LABELS_TOOLTIPS: LabelTooltipItems = {
  numberOfParts: {
    label: 'No. of parts',
    tooltip: <>Your TWAP order will be split into this many parts, which will execute one by one.</>,
  },
  totalDuration: {
    label: 'Total duration',
    tooltip: (
      <>
        The "Total duration" is the duration it takes to execute all parts of your TWAP order. For instance, your order
        consists of 2 parts placed every 30 minutes, the total time to complete the order is 1 hour. Each limit order
        remains open for 30 minutes until the next part becomes active.
      </>
    ),
  },
  partDuration: {
    label: 'Part duration',
    tooltip: (
      <>
        The "Part duration" refers to the duration between each part of your TWAP order. Choosing a shorter time allows
        for faster execution of each part, potentially reducing price fluctuations. Striking the right balance is
        crucial for optimal execution.
      </>
    ),
  },
  slippage: {
    label: 'Slippage',
    tooltip: (
      <>
        This slippage will apply to each part of your order. Since a TWAP order executes over a longer period of time,
        your slippage should take into account possible price fluctuations over that time. If your slippage is too low,
        you risk some parts of your order failing to execute.
      </>
    ),
  },
  price: {
    label: 'Current market price',
  },
  sellAmount: {
    label: 'Sell amount per part',
    tooltip: <>Estimated amount that will be sold in each part of the order.</>,
  },
  buyAmount: {
    label: 'Buy amount per part',
    tooltip: <>Estimated amount that you will receive from each part of the order.</>,
  },
}
