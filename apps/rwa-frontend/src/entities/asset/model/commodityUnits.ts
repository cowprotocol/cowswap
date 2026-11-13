import type { RwaToken } from './types'

const GRAMS_PER_TROY_OUNCE = 31.1034768
const ONE_GRAM = 1 / GRAMS_PER_TROY_OUNCE

/**
 * Troy ounces one commodity token holds, by CoinGecko id: commodity assets are priced per troy ounce, while some tokens
 * hold one gram. A token missing here has no multiplier and is priced per token
 */
const TROY_OUNCES_PER_TOKEN: Record<string, number> = {
  'pax-gold': 1,
  'tether-gold': 1,
  'tether-gold-tokens': 1,
  'matrixdock-gold': 1,
  'matrixdock-silver': 1,
  'kinesis-silver': 1,
  'goldfish-gold': 0.001,
  'kinesis-gold': ONE_GRAM,
  'vnx-gold': ONE_GRAM,
  'goldzip-gold': ONE_GRAM,
  'gram-gold': ONE_GRAM,
  'gram-silver': ONE_GRAM,
}

export function getCommodityTroyOuncesPerToken({ coingeckoId }: Pick<RwaToken, 'coingeckoId'>): number | undefined {
  return coingeckoId ? TROY_OUNCES_PER_TOKEN[coingeckoId] : undefined
}
