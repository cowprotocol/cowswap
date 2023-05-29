import { t } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useMemo } from 'react'

import useTheme from 'legacy/hooks/useTheme'
import { ThemedText } from 'legacy/theme'
import { warningSeverity } from 'legacy/utils/prices'
import { MouseoverTooltip } from 'legacy/components/Tooltip'

import Loader from 'legacy/components/Loader'
import { formatPercent } from 'utils/amountFormat'
import { FiatAmount } from 'common/pure/FiatAmount'
import { PriceImpact } from '../../../hooks/usePriceImpact'
import { Nullish } from 'types'

export function FiatValue({
  fiatValue,
  priceImpactParams,
  className,
}: {
  fiatValue?: Nullish<CurrencyAmount<Currency>>
  priceImpactParams?: PriceImpact
  className?: string
}) {
  const { priceImpact, loading: priceImpactLoading } = priceImpactParams || {}
  const theme = useTheme()

  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined

    if (priceImpact.lessThan('0')) return theme.success

    const severity = warningSeverity(priceImpact)

    if (severity < 1) return theme.text1
    if (severity < 3) return theme.danger

    return theme.red1
  }, [priceImpact, theme.success, theme.red1, theme.text1, theme.danger])

  return (
    <ThemedText.Body className={className} fontSize={14} color={fiatValue ? theme.text1 : theme.text4}>
      {fiatValue ? <FiatAmount amount={fiatValue} /> : ''}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}>
          {' '}
          <MouseoverTooltip text={t`The estimated difference between the USD values of input and output amounts.`}>
            ({formatPercent(priceImpact.multiply(-1))}%)
          </MouseoverTooltip>
        </span>
      ) : null}
      {priceImpactLoading && <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />}
    </ThemedText.Body>
  )
}
