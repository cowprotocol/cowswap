import type { RwaQuoteSide } from '@/entities/asset'

export const TRADE_SIDES: { side: RwaQuoteSide; title: string }[] = [
  { side: 'buy', title: 'Buy' },
  { side: 'sell', title: 'Sell' },
]
