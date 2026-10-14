import type { RwaToken } from '@/entities/asset'

export const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
export const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
export const AAPLX_MAINNET: RwaToken = {
  chainId: 1,
  address: '0x9d275685dC284C8eB1C79f6ABA7a63Dc75ec890a',
  symbol: 'AAPLx',
  name: 'Apple xStock',
  decimals: 18,
  issuer: 'xStocks',
}
export const AAPLX_ARBITRUM: RwaToken = { ...AAPLX_MAINNET, chainId: 42161 }
