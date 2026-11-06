import { createCowLogger, normalizeError } from '@cowprotocol/common-utils'

const log = createCowLogger('Gas estimation')

export async function estimateGasWithFallback(
  estimate: () => Promise<bigint>,
  fallbackGasLimit: bigint,
): Promise<bigint> {
  try {
    return await estimate()
  } catch (err: unknown) {
    const error = normalizeError(err)
    log.warn('Gas estimation failed; using fallback', { error, fallbackGasLimit })
    return fallbackGasLimit
  }
}
