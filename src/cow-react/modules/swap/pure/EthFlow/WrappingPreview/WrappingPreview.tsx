import { ArrowRight } from 'react-feather'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { WrapCard } from '@cow/modules/swap/pure/EthFlow/WrappingPreview/WrapCard'
import * as styledEl from '@cow/modules/swap/pure/EthFlow/WrappingPreview/styled'

import { colors } from 'theme'

const COLOUR_SHEET = colors(false)

export type WrappingPreviewProps = {
  native: Currency
  nativeBalance: CurrencyAmount<Currency> | undefined
  wrapped: Currency
  wrappedBalance: CurrencyAmount<Currency> | undefined
  amount: CurrencyAmount<Currency> | undefined
  chainId?: number
}

export const WrappingPreview = (props: WrappingPreviewProps) => {
  const { nativeBalance, native, wrapped, wrappedBalance, amount, chainId } = props

  return (
    <styledEl.WrappingPreviewContainer>
      {/* To Wrap */}
      <WrapCard balance={nativeBalance} currency={native} amountToWrap={amount} chainId={chainId} />

      <ArrowRight size={18} color={COLOUR_SHEET.primary1} />

      {/* Wrap Outcome */}
      <WrapCard balance={wrappedBalance} currency={wrapped} amountToWrap={amount} chainId={chainId} />
    </styledEl.WrappingPreviewContainer>
  )
}
