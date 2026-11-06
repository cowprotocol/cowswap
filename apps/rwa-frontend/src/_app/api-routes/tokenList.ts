import { buildRwaTokenList, getRegistry } from '@/entities/asset/index.server'
import { jsonResponse } from '@/shared/lib/http'

const TOKEN_LIST_MAX_AGE_SECONDS = 3600

export function getTokenListHandler(): Response {
  return jsonResponse(buildRwaTokenList(getRegistry()), TOKEN_LIST_MAX_AGE_SECONDS)
}
