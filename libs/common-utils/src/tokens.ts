import {
  NATIVE_CURRENCIES,
  NATIVE_CURRENCY_ADDRESS,
  WRAPPED_NATIVE_CURRENCIES as WETH,
} from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

export function isNativeAddress(tokenAddress: string, chainId: ChainId) {
  if (!tokenAddress || !chainId) return false

  if (tokenAddress === 'ETH') return true

  const native = NATIVE_CURRENCIES[chainId]

  return native && (tokenAddress === native.address || tokenAddress === native.symbol)
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
