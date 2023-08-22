import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { MouseoverTooltip } from 'legacy/components/Tooltip'

import { useHigherUSDValue } from 'modules/fiatAmount'

import { FiatAmount } from 'common/pure/FiatAmount'

import { BalanceValue, FiatValue, InfoCircle } from './styled'

type FiatBalanceCellProps = {
  balance: CurrencyAmount<Token> | undefined
}

export default function FiatBalanceCell({ balance }: FiatBalanceCellProps) {
  const hasBalance = balance?.greaterThan(0)
  const fiatValue = useHigherUSDValue(balance).value

  return (
    <BalanceValue hasBalance={!!hasBalance}>
      {fiatValue ? (
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
