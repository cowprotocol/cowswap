import { CowEnv, SupportedChainId, Trade } from '@cowprotocol/cow-sdk'

import { getTrades } from 'api/cowProtocol/api'

// Large enough that almost every order needs a single call.
export const ALL_TRADES_PAGE_SIZE = 1000
// Safety bound: reaching it means the paging is broken, not that the order has this many fills.
const MAX_TRADES_PAGES = 100

export async function fetchAllOrderTrades(chainId: SupportedChainId, orderUid: string, env?: CowEnv): Promise<Trade[]> {
  // Omitting `env` keeps the SDK's default; passing `undefined` would select barn.
  const context = env ? { chainId, env } : { chainId }
  const allTrades: Trade[] = []
  const seen = new Set<string>()

  for (let page = 0; page < MAX_TRADES_PAGES; page++) {
    const trades = await getTrades({ orderUid, offset: allTrades.length, limit: ALL_TRADES_PAGE_SIZE }, context)

    // Already-seen fills mean `offset` was ignored and an earlier page was served again.
    const newTrades = trades.filter((trade) => {
      const key = `${trade.blockNumber}-${trade.logIndex}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    allTrades.push(...newTrades)

    if (trades.length < ALL_TRADES_PAGE_SIZE || newTrades.length === 0) return allTrades
  }

  throw new Error(`Reached ${MAX_TRADES_PAGES} pages of trades for order ${orderUid}`)
}
