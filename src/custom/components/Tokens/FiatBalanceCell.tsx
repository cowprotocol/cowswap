import { Trans } from '@lingui/macro'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { FIAT_PRECISION } from 'constants/index'
import { BalanceValue, InfoCircle, FiatValue } from './styled'
import { formatSmart } from '@cow/utils/format'
import { MouseoverTooltip } from 'components/Tooltip'
import { FiatAmount } from '@cow/common/pure/FiatAmount'

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
    <BalanceValue hasBalance={!!hasBalance}>
      {formattedFiatValue ? (
        <FiatAmount amount={fiatValue} accurate={true} />
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
