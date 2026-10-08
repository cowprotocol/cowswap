import 'server-only'

import { OrderBookApi } from '@cowprotocol/cow-sdk'

let serverOrderBookApi: OrderBookApi | null = null

/** Partner API (`partners.cow.fi`) when `COW_API_KEY` is set, the public one otherwise */
export function getServerOrderBookApi(): OrderBookApi {
  serverOrderBookApi ??= new OrderBookApi({ apiKey: process.env.COW_API_KEY || undefined })

  return serverOrderBookApi
}
