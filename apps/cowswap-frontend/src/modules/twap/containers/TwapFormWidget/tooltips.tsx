import svgProtectionSrc from '@cowprotocol/assets/cow-swap/protection.svg'

import { Trans, useLingui } from '@lingui/react/macro'
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
  tooltip?: React.ReactNode | LabelTooltipFn<Record<string, unknown>>
}

export type LabelTooltipContent<TParams> = React.ReactNode | LabelTooltipFn<TParams>

export type LabelTooltipFn<TParams> = (params: TParams) => React.ReactNode

export interface LabelTooltipItems {
  [key: string]: LabelTooltip
}

export interface TotalDurationTooltipParams {
  parts: number
  partDuration: number
  totalDuration?: number
}

export function getTotalDurationTooltip({
  parts,
  partDuration,
  totalDuration,
}: TotalDurationTooltipParams): React.ReactNode {
  const partDurationDisplay = deadlinePartsDisplay(partDuration)
  const totalDurationDisplay = deadlinePartsDisplay(totalDuration ?? parts * partDuration)

  return (
    <>
      <p>
        <Trans>The "Total duration" is the duration it takes to execute all parts of your TWAP order.</Trans>
      </p>
      <p>
        <Trans>
          For instance, your order consists of <b>{parts} parts</b> placed every <b>{partDurationDisplay}</b>, the total
          time to complete the order is <b>{totalDurationDisplay}</b>. Each limit order remains open for{' '}
          <b>{partDurationDisplay}</b> until the next part becomes active.
        </Trans>
      </p>
    </>
  )
}

export function useAmountPartsLabels(): Pick<LabelTooltipItems, 'sellAmount' | 'buyAmount'> {
  const tooltips = useLabelsTooltips()
  return {
    sellAmount: tooltips.sellAmount,
    buyAmount: tooltips.buyAmount,
  }
}

export function useLabelsTooltips(): LabelTooltipItems {
  const { t } = useLingui()

  return {
    numberOfParts: {
      label: t`No. of parts`,
      tooltip: t`Your TWAP order will be split into this many parts, which will execute one by one.`,
    },
    totalDuration: {
      label: t`Total duration`,
      tooltip: getTotalDurationTooltip as unknown as LabelTooltip['tooltip'],
    },
    partDuration: {
      label: t`Part duration`,
      tooltip: (
        <Trans>
          The "Part duration" refers to the duration between each part of your TWAP order.
          <br />
          <br />
          Choosing a shorter time allows for faster execution of each part, potentially reducing price fluctuations.
          Striking the right balance is crucial for optimal execution.
        </Trans>
      ),
    },
    slippage: {
      label: (
        <>
          <IconImage>
            <SVG src={svgProtectionSrc} width="16" height="16" title={t`Price protection`} />
          </IconImage>{' '}
          <Trans>Price protection</Trans>
        </>
      ),
      tooltip: (
        <Trans>
          Your TWAP order won't execute and is protected if the market price dips more than your set price protection.
        </Trans>
      ),
    },
    price: {
      label: t`Rate`,
      tooltip: t`This is the current market price, including the fee.`,
    },
    sellAmount: {
      label: t`Sell per part`,
      tooltip: t`Estimated amount that will be sold in each part of the order.`,
    },
    buyAmount: {
      label: t`Buy per part`,
      tooltip: t`Estimated amount that you will receive from each part of the order.`,
    },
    startTime: {
      label: t`Start time`,
      tooltip: t`The order will start when it is validated and executed in your Safe.`,
    },
  }
}
