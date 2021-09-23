import React, { useMemo } from 'react'
import TradePriceMod, { TradePriceProps } from './TradePriceMod'
import { useHigherUSDValue /*  useUSDCValue */ } from 'hooks/useUSDCPrice'
import { formatSmart } from 'utils/format'
import { tryParseAmount } from 'state/swap/hooks'
import { FIAT_PRECISION } from 'constants/index'

export * from './TradePriceMod'

export default function TradePrice(props: Omit<TradePriceProps, 'fiatValue'>) {
  const { price, showInverted } = props

  const priceSide = useMemo(
    () =>
      !showInverted
        ? tryParseAmount(price.invert().toFixed(price.baseCurrency.decimals), price.baseCurrency)
        : tryParseAmount(price.toFixed(price.quoteCurrency.decimals), price.quoteCurrency),
    [price, showInverted]
  )
  // const amount = useUSDCValue(priceSide)
  const amount = useHigherUSDValue(priceSide)
  const fiatValueFormatted = formatSmart(amount, FIAT_PRECISION)

  return <TradePriceMod {...props} fiatValue={fiatValueFormatted} />
}
