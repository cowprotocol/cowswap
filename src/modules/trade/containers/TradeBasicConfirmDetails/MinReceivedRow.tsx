import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'

type Props = {
  amount: Nullish<CurrencyAmount<Currency>>
  usdAmount: Nullish<CurrencyAmount<Currency>>
}

export function MinReceivedRow(props: Props) {
  return <ReviewOrderModalAmountRow {...props} tooltip="TODO: Min received tooltip" label="Min received (incl. fee)" />
}
