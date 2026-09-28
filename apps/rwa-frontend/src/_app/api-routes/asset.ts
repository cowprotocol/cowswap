import { getAsset } from '@/entities/asset/index.server'
import { errorResponse, jsonResponse } from '@/shared/lib/http'

export async function getAssetHandler(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
): Promise<Response> {
  const { ticker } = await params
  const asset = await getAsset(ticker)

  if (!asset) return errorResponse(404, `Asset "${ticker}" not found`)

  return jsonResponse(asset, 60)
}
