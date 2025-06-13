import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'


interface FormatLocaleNumberArgs {
  number: CurrencyAmount<Currency> | Price<Currency, Currency> | number
  locale: string | null | undefined
  options?: Intl.NumberFormatOptions
  sigFigs?: number
  fixedDecimals?: number
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export default function formatLocaleNumber({
  number,
  locale,
  sigFigs,
  fixedDecimals,
  options = {},
}: FormatLocaleNumberArgs): string {
  let localeArg: string | string[]
  if (!locale || (locale && !SUPPORTED_LOCALES.includes(locale))) {
    localeArg = DEFAULT_LOCALE
  } else {
    localeArg = [locale, DEFAULT_LOCALE]
  }
  options.minimumFractionDigits = options.minimumFractionDigits || fixedDecimals
  options.maximumFractionDigits = options.maximumFractionDigits || fixedDecimals

  // Fixed decimals should override significant figures.
  options.maximumSignificantDigits = options.maximumSignificantDigits || fixedDecimals ? undefined : sigFigs

  let numberString: number
  if (typeof number === 'number') {
    numberString = fixedDecimals ? parseFloat(number.toFixed(fixedDecimals)) : number
  } else {
    const baseString = parseFloat(number.toSignificant(sigFigs))
    numberString = fixedDecimals ? parseFloat(baseString.toFixed(fixedDecimals)) : baseString
  }

  return numberString.toLocaleString(localeArg, options)
}
