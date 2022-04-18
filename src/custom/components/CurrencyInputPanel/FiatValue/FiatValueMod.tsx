import { Trans } from '@lingui/macro'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import HoverInlineText from 'components/HoverInlineText'
import { useMemo } from 'react'

import useTheme from 'hooks/useTheme'
import { ThemedText } from 'theme'
import { warningSeverity } from 'utils/prices'
import { MouseoverTooltip } from 'components/Tooltip'

// MOD imports
import { FIAT_PRECISION, PERCENTAGE_PRECISION } from 'constants/index' // mod
import { formatSmart } from 'utils/format'
import Loader from 'components/Loader'

export function FiatValue({
  fiatValue,
  priceImpact,
  priceImpactLoading, // mod
  className, // mod
}: {
  fiatValue: CurrencyAmount<Currency> | null | undefined
  priceImpact?: Percent
  priceImpactLoading?: boolean
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
    <ThemedText.Body className={className} fontSize={14} color={fiatValue ? theme.text1 : theme.text4}>
      {fiatValue ? (
        <Trans>
          ≈ $
          <HoverInlineText
            text={formatSmart(fiatValue, FIAT_PRECISION, {
              thousandSeparator: true,
              isLocaleAware: true,
            })}
          />
        </Trans>
      ) : (
        ''
      )}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}>
          {' '}
          <MouseoverTooltip text={t`The estimated difference between the USD values of input and output amounts.`}>
            (<Trans>{formatSmart(priceImpact.multiply(-1), PERCENTAGE_PRECISION)}%</Trans>)
          </MouseoverTooltip>
        </span>
      ) : null}
      {priceImpactLoading && <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />}
    </ThemedText.Body>
  )
}
