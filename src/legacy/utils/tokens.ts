import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { GpEther as ETHER, WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'

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
