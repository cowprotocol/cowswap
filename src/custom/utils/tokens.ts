import { ChainId, ETHER, WETH } from '@uniswap/sdk'

export function toErc20Address(tokenAddress: string, chainId: ChainId): string {
  let checkedAddress = tokenAddress
  if (tokenAddress === 'ETH' || tokenAddress === ETHER.symbol) {
    checkedAddress = WETH[chainId].address
  }

  return checkedAddress
}
