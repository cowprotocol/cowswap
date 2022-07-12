import { Trans } from '@lingui/macro'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { useHigherUSDValue } from 'hooks/useUSDCPrice'
import { FIAT_PRECISION } from 'constants/index'
import { useActiveWeb3React } from 'hooks/web3'
import { BalanceValue, BalanceInfoCircle, FiatValue } from './styled'
import { formatSmart } from 'utils/format'
import { MouseoverTooltip } from 'components/Tooltip'
import Loader from 'components/Loader'

type FiatBalanceCellProps = {
  balance: CurrencyAmount<Token> | undefined
}

export default function FiatBalanceCell({ balance }: FiatBalanceCellProps) {
  const { account } = useActiveWeb3React()
  const hasBalance = balance?.greaterThan(0)
  const fiatValue = useHigherUSDValue(balance)
  const formattedFiatValue = formatSmart(fiatValue, FIAT_PRECISION, {
    thousandSeparator: true,
    isLocaleAware: true,
  })

  if (!balance && account) return <Loader />
  if (!hasBalance) return <BalanceValue hasBalance={false}>0</BalanceValue>

  return (
    <BalanceValue title={fiatValue?.toExact()} hasBalance={!!hasBalance}>
      {formattedFiatValue ? (
        <span>$ {formattedFiatValue}</span>
      ) : (
        <FiatValue>
          <span>$ 0.00</span>
          <MouseoverTooltip text={<Trans>Value may be zero due to missing token price information</Trans>}>
            <BalanceInfoCircle size="20" color={'white'} />
          </MouseoverTooltip>
        </FiatValue>
      )}
    </BalanceValue>
  )
}
