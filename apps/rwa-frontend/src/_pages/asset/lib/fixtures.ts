import type { RwaToken } from '@/entities/asset'

export const AAPLX_MAINNET: RwaToken = {
  chainId: 1,
  address: '0x9d275685dC284C8eB1C79f6ABA7a63Dc75ec890a',
  symbol: 'AAPLx',
  name: 'Apple xStock',
  decimals: 18,
  issuer: 'xStocks',
}
export const AAPLX_ARBITRUM: RwaToken = { ...AAPLX_MAINNET, chainId: 42161 }
