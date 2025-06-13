import {
  NATIVE_CURRENCIES,
  NATIVE_CURRENCY_ADDRESS,
  WRAPPED_NATIVE_CURRENCIES as WETH,
} from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function isNativeAddress(tokenAddress: string, chainId: ChainId) {
  if (!tokenAddress || !chainId) return false

  const tokenAddressLower = tokenAddress.toLowerCase()

  if (tokenAddressLower === 'eth') return true

  const native = NATIVE_CURRENCIES[chainId]

  return (
    native && (tokenAddressLower === native.address.toLowerCase() || tokenAddressLower === native.symbol?.toLowerCase())
  )
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
