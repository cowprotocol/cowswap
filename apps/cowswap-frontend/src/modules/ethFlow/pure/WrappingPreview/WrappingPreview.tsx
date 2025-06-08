import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ArrowRight } from 'react-feather'

import * as styledEl from './styled'
import { WrapCard } from './WrapCard'

export type WrappingPreviewProps = {
  native: Currency
  nativeBalance: CurrencyAmount<Currency> | undefined
  wrapped: Currency
  wrappedBalance: CurrencyAmount<Currency> | undefined
  amount: CurrencyAmount<Currency> | undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const WrappingPreview = (props: WrappingPreviewProps) => {
  const { nativeBalance, native, wrapped, wrappedBalance, amount } = props

  return (
    <styledEl.WrappingPreviewContainer>
      {/* To Wrap */}
      <WrapCard balance={nativeBalance} currency={native} amountToWrap={amount} />

      <ArrowRight size={18} />

      {/* Wrap Outcome */}
      <WrapCard balance={wrappedBalance} currency={wrapped} amountToWrap={amount} />
    </styledEl.WrappingPreviewContainer>
  )
}
