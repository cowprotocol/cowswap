import { ArrowRight } from 'react-feather'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { WrapCardContainer, WrapCard } from './WrapCard'

import { colors } from 'theme'

const COLOUR_SHEET = colors(false)

export type WrappingVisualisationParams = {
  nativeSymbol: string
  nativeBalance: CurrencyAmount<Currency> | undefined
  native: Currency
  nativeInput: CurrencyAmount<Currency> | undefined
  wrappedBalance: CurrencyAmount<Currency> | undefined
  wrappedSymbol: string
  wrapped: Currency
  chainId?: number
}

const WrappingVisualisation = ({
  nativeSymbol,
  nativeBalance,
  native,
  wrapped,
  wrappedBalance,
  wrappedSymbol,
  nativeInput,
  chainId,
}: WrappingVisualisationParams) => (
  <WrapCardContainer>
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
  </WrapCardContainer>
)

export default WrappingVisualisation
