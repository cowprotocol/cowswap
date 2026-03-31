import { TokenWithLogo, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

export function getWrappedToken(currency: Currency): TokenWithLogo {
  return WRAPPED_NATIVE_CURRENCIES[currency.chainId as SupportedChainId] ?? (currency as TokenWithLogo)
}
