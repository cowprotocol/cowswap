import {
  NATIVE_CURRENCY_ADDRESS,
  WRAPPED_NATIVE_CURRENCIES as WETH,
  NATIVE_CURRENCIES,
} from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

export function isNativeAddress(tokenAddress: string, chainId: ChainId) {
  if (!tokenAddress) return false

  // First check for ETH as it's a common case
  if (tokenAddress === 'ETH') return true

  // Then check if we have a valid chainId and native currency for it
  const nativeCurrency = chainId && NATIVE_CURRENCIES[chainId]
  return nativeCurrency ? tokenAddress === nativeCurrency.symbol : false
}

export function toErc20Address(tokenAddress: string, chainId: ChainId): string {
  let checkedAddress = tokenAddress
  if (isNativeAddress(tokenAddress, chainId)) {
    checkedAddress = WETH[chainId].address
  }

  return checkedAddress
}

export function toNativeBuyAddress(tokenAddress: string, chainId: ChainId): string {
  let checkedAddress = tokenAddress
  if (isNativeAddress(tokenAddress, chainId)) {
    checkedAddress = NATIVE_CURRENCY_ADDRESS
  }

  return checkedAddress
}
