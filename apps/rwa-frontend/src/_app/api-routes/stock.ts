import { getAssetByTicker, getAssetStock } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse } from '@/shared/lib/http'

/** Stock market of the share behind the asset, `market: null` when no stock data provider covers it */
export async function getStockHandler(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
): Promise<Response> {
  const { ticker } = await params
  const asset = getAssetByTicker(ticker)

  if (!asset) return errorResponse(404, `Asset "${ticker}" not found`)

  return jsonResponse(await getAssetStock(asset), 60)
}
