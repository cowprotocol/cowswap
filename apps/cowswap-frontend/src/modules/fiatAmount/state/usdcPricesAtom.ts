import { atom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Price, Token } from '@uniswap/sdk-core'

import { USDC } from 'legacy/constants/tokens'

import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

import { fiatPricesAtom, FiatPriceState } from './fiatPricesAtom'

export interface UsdcPriceState extends Omit<FiatPriceState, 'price'> {
  price: Price<Token, Token>
}

export type UsdcPrices = { [tokenAddress: string]: UsdcPriceState }

export const usdcPricesAtom = atom((get) => {
  const fiatPrices = get(fiatPricesAtom)

  return Object.keys(fiatPrices).reduce<UsdcPrices>((acc, tokenAddress) => {
    const fiatPrice = fiatPrices[tokenAddress]

    if (fiatPrice.price === null) {
      return acc
    }

    const currency = fiatPrice.currency
    const usdcToken = USDC[currency.chainId as SupportedChainId]

    const baseAmount = tryParseCurrencyAmount('1', currency)
    const quoteAmount = tryParseCurrencyAmount(fiatPrice.price.toString(), usdcToken)

    acc[tokenAddress] = {
      ...fiatPrice,
      price: new Price({
        baseAmount,
        quoteAmount,
      }),
    }

    return acc
  }, {})
})
