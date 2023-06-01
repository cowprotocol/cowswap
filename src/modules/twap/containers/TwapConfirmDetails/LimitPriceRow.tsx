import { ConfirmDetailsItem } from 'modules/twap/pure/ConfirmDetailsItem'

import { RateInfo, RateInfoParams } from 'common/pure/RateInfo'

type Props = {
  rateInfoParams: RateInfoParams
}
export function LimitPriceRow(props: Props) {
  const { rateInfoParams } = props

  return (
    <ConfirmDetailsItem tooltip="TODO: limit price tooltip text" label="Limit price (incl fee/slippage)">
      <RateInfo
        isInvertedState={[true, () => {}]}
        prependSymbol={false}
        noLabel={true}
        doNotUseSmartQuote
        isInverted={true}
        rateInfoParams={rateInfoParams}
        opacitySymbol={true}
      />
    </ConfirmDetailsItem>
  )
}
