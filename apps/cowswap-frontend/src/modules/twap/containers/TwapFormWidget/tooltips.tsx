import svgProtectionSrc from '@cowprotocol/assets/cow-swap/protection.svg'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import {
  TotalDurationTooltip,
  TotalDurationTooltipProps,
} from '../../pure/TotalDurationTooltip/TotalDurationTooltip.pure'

const IconImage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > svg {
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    fill: currentColor;
    margin: 0 3px 0 0;
  }
`

export interface LabelTooltip<TParams = void> {
  label: React.ReactNode
  tooltip?: LabelTooltipContent<TParams>
}

export type LabelTooltipContent<TParams = void> = React.ReactNode | LabelTooltipFn<TParams>

export type LabelTooltipFn<TParams> = (params: TParams) => React.ReactNode

export interface LabelTooltipItems {
  numberOfParts: LabelTooltip
  totalDuration: LabelTooltip<TotalDurationTooltipProps>
  partDuration: LabelTooltip
  slippage: LabelTooltip
  price: LabelTooltip
  sellAmount: LabelTooltip
  buyAmount: LabelTooltip
  startTime: LabelTooltip
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
      tooltip: TotalDurationTooltip,
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
            <SVG src={svgProtectionSrc} width="16" height="16" title={t`Worst acceptable price`} />
          </IconImage>{' '}
          <Trans>Worst acceptable price</Trans>
        </>
      ),
      tooltip: (
        <Trans>Each part trades at this price or better. If that price can't be met, the part is skipped.</Trans>
      ),
    },
    price: {
      label: t`Quoted price`,
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
