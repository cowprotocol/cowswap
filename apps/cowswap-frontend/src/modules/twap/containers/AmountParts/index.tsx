import { useAtomValue } from 'jotai'
import { ReactElement, ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { HelpTooltip, renderTooltip } from '@cowprotocol/ui'

import { Nullish } from 'types'

import { useGetReceiveAmountInfo } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import * as styledEl from './styled'

import { twapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { useAmountPartsLabels } from '../TwapFormWidget/tooltips'

interface TradeAmountPreviewProps {
  amount: Nullish<CurrencyAmount<Currency>>
  usdAmount: Nullish<CurrencyAmount<Currency>>
  label: ReactElement
  tooltip: ReactNode
  children?: ReactNode
}

export function AmountParts(): ReactNode {
  const {
    sellAmount: { label: sellLabel, tooltip: sellTooltip },
    buyAmount: { label: buyLabel, tooltip: buyTooltip },
  } = useAmountPartsLabels()

  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)

  const receiveAmountInfo = useGetReceiveAmountInfo()

  const { sellAmount: inputPartAmount } = receiveAmountInfo?.beforeAllFees || {}
  const { buyAmount: outputPartAmount } = receiveAmountInfo?.afterPartnerFees || {}

  const inputPartAmountUsd = useUsdAmount(inputPartAmount).value
  const outputPartAmountUsd = useUsdAmount(outputPartAmount).value

  return (
    <styledEl.Wrapper>
      <TradeAmountPreview
        label={
          <>
            {sellLabel} (1/{numberOfPartsValue})
          </>
        }
        tooltip={renderTooltip(sellTooltip)}
        amount={inputPartAmount}
        usdAmount={inputPartAmountUsd}
      />

      <TradeAmountPreview
        label={
          <>
            {buyLabel} (1/{numberOfPartsValue})
          </>
        }
        tooltip={renderTooltip(buyTooltip)}
        amount={outputPartAmount}
        usdAmount={outputPartAmountUsd}
      ></TradeAmountPreview>
    </styledEl.Wrapper>
  )
}

function TradeAmountPreview(props: TradeAmountPreviewProps): ReactNode {
  const { amount, usdAmount, label, tooltip, children } = props

  return (
    <styledEl.Part>
      <styledEl.Label>
        {label}
        <HelpTooltip text={tooltip} />
      </styledEl.Label>

      <styledEl.Amount amount={amount} tokenSymbol={amount?.currency} />
      <styledEl.Fiat amount={usdAmount} />
      {children}
    </styledEl.Part>
  )
}
