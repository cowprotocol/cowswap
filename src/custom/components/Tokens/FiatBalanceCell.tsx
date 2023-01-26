import { Trans } from '@lingui/macro'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { FIAT_PRECISION } from 'constants/index'
import { BalanceValue, InfoCircle, FiatValue } from './styled'
import { formatMax, formatSmart } from '@cow/utils/format'
import { MouseoverTooltip } from 'components/Tooltip'

type FiatBalanceCellProps = {
  balance: CurrencyAmount<Token> | undefined
}

export default function FiatBalanceCell({ balance }: FiatBalanceCellProps) {
  const hasBalance = balance?.greaterThan(0)
  const fiatValue = useHigherUSDValue(balance)
  const formattedFiatValue = formatSmart(fiatValue, FIAT_PRECISION, {
    thousandSeparator: true,
    isLocaleAware: true,
  })

  return (
    <BalanceValue title={formatMax(fiatValue || undefined, fiatValue?.currency.decimals)} hasBalance={!!hasBalance}>
      {formattedFiatValue ? (
        <span>$ {formattedFiatValue}</span>
      ) : (
        <FiatValue>
          <span>$ 0.00</span>
          <MouseoverTooltip text={<Trans>Value may be zero due to missing token price information</Trans>}>
            <InfoCircle size="20" color={'white'} />
          </MouseoverTooltip>
        </FiatValue>
      )}
    </BalanceValue>
  )
}
