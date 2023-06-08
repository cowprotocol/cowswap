import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'

import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'

type Props = {
  amount: Nullish<CurrencyAmount<Currency>>
  usdAmount: Nullish<CurrencyAmount<Currency>>
}

export function MinReceivedRow(props: Props) {
  const { amount, usdAmount } = props

  return (
    <ConfirmDetailsItem tooltip="TODO: Min received tooltip" label="Min received (incl. fee)">
      <TokenAmount amount={amount} defaultValue="-" tokenSymbol={amount?.currency} />
      {usdAmount && (
        <i>
          &nbsp;(
          <FiatAmount amount={usdAmount} />)
        </i>
      )}
    </ConfirmDetailsItem>
  )
}
