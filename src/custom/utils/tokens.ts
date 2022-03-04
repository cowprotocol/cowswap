import { SupportedChainId as ChainId } from 'constants/chains'
import { GpEther as ETHER, WETH9_EXTENDED as WETH } from 'constants/tokens'
import { NATIVE_CURRENCY_BUY_ADDRESS } from '../constants'

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
