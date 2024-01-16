import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

import { ArrowRight } from 'react-feather'

import * as styledEl from 'modules/swap/pure/EthFlow/WrappingPreview/styled'
import { WrapCard } from 'modules/swap/pure/EthFlow/WrappingPreview/WrapCard'

export type WrappingPreviewProps = {
  native: Currency
  nativeBalance: CurrencyAmount<Currency> | undefined
  wrapped: Currency
  wrappedBalance: CurrencyAmount<Currency> | undefined
  amount: CurrencyAmount<Currency> | undefined
}

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
