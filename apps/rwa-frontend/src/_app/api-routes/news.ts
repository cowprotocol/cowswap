import { getAssetByTicker, getAssetNews, NEWS_FEED_REVALIDATE_SECONDS } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse } from '@/shared/lib/http'

/** Latest press releases from the official feed of the asset issuer */
export async function getNewsHandler(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
): Promise<Response> {
  const { ticker } = await params
  const asset = getAssetByTicker(ticker)

  if (!asset) return errorResponse(404, `Asset "${ticker}" not found`)

  return jsonResponse(await getAssetNews(asset), NEWS_FEED_REVALIDATE_SECONDS)
}
