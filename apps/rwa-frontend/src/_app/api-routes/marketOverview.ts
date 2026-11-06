import { getMarketOverview } from '@/entities/asset/index.server'
import { jsonResponse } from '@/shared/lib/http'

const MARKET_OVERVIEW_MAX_AGE_SECONDS = 60

/** Registry-wide totals, most traded assets and top movers */
export async function getMarketOverviewHandler(): Promise<Response> {
  return jsonResponse(await getMarketOverview(), MARKET_OVERVIEW_MAX_AGE_SECONDS)
}
