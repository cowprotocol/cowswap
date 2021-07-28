import React, { useMemo } from 'react'
import TradePriceMod, { TradePriceProps } from './TradePriceMod'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { formatSmart } from 'utils/format'
import { tryParseAmount } from 'state/swap/hooks'
import { FIAT_PRECISION, MAX_PRECISION } from 'constants/index'

export * from './TradePriceMod'

export default function TradePrice(props: Omit<TradePriceProps, 'fiatValue'>) {
  const { price, showInverted } = props

  const priceSide = useMemo(
    () =>
      !showInverted
        ? tryParseAmount(price.invert().toFixed(MAX_PRECISION), price.baseCurrency)
        : tryParseAmount(price.toFixed(MAX_PRECISION), price.quoteCurrency),
    [price, showInverted]
  )
  const amount = useUSDCValue(priceSide)
  const fiatValueFormatted = formatSmart(amount, FIAT_PRECISION, { smallLimit: '0.01' })

  return <TradePriceMod {...props} fiatValue={fiatValueFormatted} />
}
