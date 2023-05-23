// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { useMemo } from 'react'

import useTheme from 'legacy/hooks/useTheme'
import { ThemedText } from 'legacy/theme'
import { warningSeverity } from 'legacy/utils/prices'
import { MouseoverTooltip } from 'legacy/components/Tooltip'

// MOD imports
// mod
import Loader from 'legacy/components/Loader'
import { formatPercent } from 'utils/amountFormat'
import { FiatAmount } from 'common/pure/FiatAmount'

export function FiatValue({
  fiatValue,
  priceImpact,
  priceImpactLoading, // mod
  className, // mod
  isLoading, // mod
}: {
  fiatValue: CurrencyAmount<Currency> | null | undefined
  priceImpact?: Percent
  priceImpactLoading?: boolean
  className?: string // mod
  isLoading?: boolean // mod
}) {
  const theme = useTheme()
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined
    if (priceImpact.lessThan('0'))
      // return theme.green1
      return theme.success // MOD
    const severity = warningSeverity(priceImpact)
    // if (severity < 1) return theme.text3
    if (severity < 1) return theme.text1 // MOD
    // if (severity < 3) return theme.yellow1
    if (severity < 3) return theme.danger // MOD
    return theme.red1
  }, [
    priceImpact,
    // theme.green1,
    theme.success, // MOD
    theme.red1,
    // theme.text3,
    theme.text1, // MOD
    // theme.yellow1
    theme.danger, // MOD
  ])

  return (
    <ThemedText.Body className={className} fontSize={14} color={fiatValue ? theme.text1 : theme.text4}>
      {fiatValue && !isLoading ? <FiatAmount amount={fiatValue} /> : ''}
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
