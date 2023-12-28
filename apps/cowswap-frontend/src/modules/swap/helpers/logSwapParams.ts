type SwapParamsData = Record<string, string | number | null | undefined>

const CACHE: Record<string, SwapParamsData> = {}

export function logSwapParams(key: string, data: SwapParamsData) {
  const cached = CACHE[key]

  if (cached && JSON.stringify(cached) === JSON.stringify(data)) return

  CACHE[key] = data
  console.log(`[SWAP PARAMS] ${key}`, data)
}
