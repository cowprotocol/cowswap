import { ArrowRight } from 'react-feather'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { WrapCard } from './WrapCard'
import * as styledEl from './styled'

import { colors } from 'theme'

const COLOUR_SHEET = colors(false)

export type WrappingPreviewProps = {
  nativeSymbol: string
  nativeBalance: CurrencyAmount<Currency> | undefined
  native: Currency
  nativeInput: CurrencyAmount<Currency> | undefined
  wrappedBalance: CurrencyAmount<Currency> | undefined
  wrappedSymbol: string
  wrapped: Currency
  chainId?: number
}

export const WrappingPreview = (props: WrappingPreviewProps) => {
  const { nativeSymbol, nativeBalance, native, wrapped, wrappedBalance, wrappedSymbol, nativeInput, chainId } = props

  return (
    <styledEl.WrappingPreviewContainer>
      {/* To Wrap */}
      <WrapCard
        symbol={nativeSymbol}
        balance={nativeBalance}
        currency={native}
        amountToWrap={nativeInput}
        chainId={chainId}
      />

      <ArrowRight size={18} color={COLOUR_SHEET.primary1} />

      {/* Wrap Outcome */}
      <WrapCard
        symbol={wrappedSymbol}
        balance={wrappedBalance}
        currency={wrapped}
        amountToWrap={nativeInput}
        chainId={chainId}
      />
    </styledEl.WrappingPreviewContainer>
  )
}
