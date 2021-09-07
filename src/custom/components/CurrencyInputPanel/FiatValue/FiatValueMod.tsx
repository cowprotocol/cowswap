import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import React, { useMemo } from 'react'
import useTheme from 'hooks/useTheme'
import { TYPE } from 'theme'
import { warningSeverity } from 'utils/prices'
import HoverInlineText from 'components/HoverInlineText'
import { Trans } from '@lingui/macro'

import { FIAT_PRECISION, PERCENTAGE_PRECISION } from 'constants/index' // mod
import { formatSmart } from 'utils/format'

export function FiatValue({
  fiatValue,
  priceImpact,
  className, // mod
}: {
  fiatValue: CurrencyAmount<Currency> | null | undefined
  priceImpact?: Percent
  className?: string // mod
}) {
  const theme = useTheme()
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined
    if (priceImpact.lessThan('0')) return theme.green1
    const severity = warningSeverity(priceImpact)
    if (severity < 1) return theme.text3
    if (severity < 3) return theme.yellow1
    return theme.red1
  }, [priceImpact, theme.green1, theme.red1, theme.text3, theme.yellow1])

  return (
    <TYPE.body className={className} fontSize={14} color={fiatValue ? theme.text1 /* theme.text2 */ : theme.text4}>
      {fiatValue ? (
        <Trans>
          ≈ $
          <HoverInlineText
            text={formatSmart(fiatValue, FIAT_PRECISION) /* fiatValue?.toSignificant(6, { groupSeparator: ',' }) */}
          />
        </Trans>
      ) : (
        ''
      )}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}>
          &nbsp;({formatSmart(priceImpact.multiply(-1), PERCENTAGE_PRECISION)}%)
        </span>
      ) : null}
    </TYPE.body>
  )
}
