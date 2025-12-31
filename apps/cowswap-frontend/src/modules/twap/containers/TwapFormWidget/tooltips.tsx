import { Trans, useLingui } from '@lingui/react/macro'
import ShieldImage from 'assets/cow-swap/protection.svg'
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

export function useLabelsTooltips(): LabelTooltipItems {
  const { t } = useLingui()

  return {
    numberOfParts: {
      label: t`No. of parts`,
      tooltip: t`Your TWAP order will be split into this many parts, which will execute one by one.`,
    },
    totalDuration: {
      label: t`Total duration`,
      tooltip: ({ parts, partDuration }: { parts: number; partDuration: number }) => {
        const partDurationDisplay = deadlinePartsDisplay(partDuration)
        const totalDurationDisplay = deadlinePartsDisplay(parts * partDuration)
        return (
          <Trans>
            The "Total duration" is the duration it takes to execute all parts of your TWAP order.
            <br />
            <br />
            For instance, your order consists of <b>{parts} parts</b> placed every <b>{partDurationDisplay}</b>, the
            total time to complete the order is <b>{totalDurationDisplay}</b>. Each limit order remains open for{' '}
            <b>{partDurationDisplay}</b> until the next part becomes active.
          </Trans>
        )
      },
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
            <SVG src={ShieldImage} width="16" height="16" title={t`Price protection`} />
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

export function useAmountPartsLabels(): Pick<LabelTooltipItems, 'sellAmount' | 'buyAmount'> {
  const tooltips = useLabelsTooltips()
  return {
    sellAmount: tooltips.sellAmount,
    buyAmount: tooltips.buyAmount,
  }
}
