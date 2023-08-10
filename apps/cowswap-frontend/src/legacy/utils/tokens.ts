import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'
import { GpEther as ETHER, WRAPPED_NATIVE_CURRENCY as WETH } from 'legacy/constants/tokens'

export function isNativeAddress(tokenAddress: string, chainId: ChainId) {
  return tokenAddress === 'ETH' || tokenAddress === ETHER.onChain(chainId).symbol
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
