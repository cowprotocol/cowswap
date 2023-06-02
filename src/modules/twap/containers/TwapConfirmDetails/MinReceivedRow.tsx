import { Currency } from '@uniswap/sdk-core'

import { FractionLike, Nullish } from 'types'

import { ConfirmDetailsItem } from 'modules/twap/pure/ConfirmDetailsItem'

import { TokenAmount } from 'common/pure/TokenAmount'

type Props = {
  amount: Nullish<FractionLike>
  currency: Currency | undefined
}

export function MinReceivedRow(props: Props) {
  const { amount, currency } = props

  return (
    <ConfirmDetailsItem tooltip="TODO: Min received tooltip" label="Min received (incl. fee)">
      <TokenAmount amount={amount} defaultValue="-" tokenSymbol={currency} />
    </ConfirmDetailsItem>
  )
}
