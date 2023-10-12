import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCY_BUY_ADDRESS, WRAPPED_NATIVE_TOKEN as WETH, NATIVE_TOKEN } from '@cowprotocol/common-const'

export function isNativeAddress(tokenAddress: string, chainId: ChainId) {
  return tokenAddress === 'ETH' || tokenAddress === NATIVE_TOKEN[chainId].symbol
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
    checkedAddress = NATIVE_CURRENCY_BUY_ADDRESS
  }

  return checkedAddress
}
