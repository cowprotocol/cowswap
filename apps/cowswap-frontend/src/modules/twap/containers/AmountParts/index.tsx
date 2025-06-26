import { useAtomValue } from 'jotai'
import { ReactElement, ReactNode } from 'react'

import { HelpTooltip, renderTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Nullish } from 'types'

import { useReceiveAmountInfo } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import * as styledEl from './styled'

import { AMOUNT_PARTS_LABELS } from '../../containers/TwapFormWidget/tooltips'
import { twapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'

interface TradeAmountPreviewProps {
  amount: Nullish<CurrencyAmount<Currency>>
  usdAmount: Nullish<CurrencyAmount<Currency>>
  label: ReactElement
  tooltip: ReactNode
  children?: ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function TradeAmountPreview(props: TradeAmountPreviewProps) {
  const { amount, usdAmount, label, tooltip, children } = props

  return (
    <styledEl.Part>
      <styledEl.Label>
        <Trans>{label}</Trans>
        <HelpTooltip text={tooltip} />
      </styledEl.Label>

      <styledEl.Amount amount={amount} tokenSymbol={amount?.currency} />
      <styledEl.Fiat amount={usdAmount} />
      {children}
    </styledEl.Part>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AmountParts() {
  const {
    sellAmount: { label: sellLabel, tooltip: sellTooltip },
    buyAmount: { label: buyLabel, tooltip: buyTooltip },
  } = AMOUNT_PARTS_LABELS

  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)

  const receiveAmountInfo = useReceiveAmountInfo()

  const { sellAmount: inputPartAmount, buyAmount: outputPartAmount } = receiveAmountInfo?.afterPartnerFees || {}

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
