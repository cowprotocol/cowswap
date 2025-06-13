import { FiatAmount, HoverTooltip } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { useUsdAmount } from 'modules/usdAmount'

import { BalanceValue, FiatValue, InfoCircle } from './styled'

type FiatBalanceCellProps = {
  balance: CurrencyAmount<Token> | undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FiatBalanceCell({ balance }: FiatBalanceCellProps) {
  const hasBalance = balance?.greaterThan(0)
  const fiatValue = useUsdAmount(balance).value

  return (
    <BalanceValue hasBalance={!!hasBalance}>
      {fiatValue ? (
        <FiatAmount amount={fiatValue} accurate={true} />
      ) : (
        <FiatValue>
          <span>$ 0.00</span>
          <HoverTooltip wrapInContainer content={<Trans>Value may be zero due to missing token price information</Trans>}>
            <InfoCircle size="20" color={'white'} />
          </HoverTooltip>
        </FiatValue>
      )}
    </BalanceValue>
  )
}
