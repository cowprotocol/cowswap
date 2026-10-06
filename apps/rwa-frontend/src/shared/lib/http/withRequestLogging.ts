import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'

import { logger } from '../logger/index.server'

export function withRequestLogging<R extends Request, A extends unknown[]>(
  route: string,
  handler: (request: R, ...args: A) => Promise<Response>,
): (request: R, ...args: A) => Promise<Response> {
  return async (request, ...args) => {
    const startedAt = performance.now()
    const method = request.method

    try {
      const response = await handler(request, ...args)
      const status = response.status

      logger.info({ route, method, status, durationMs: elapsedMs(startedAt) }, 'api request')

      return response
    } catch (err: unknown) {
      const error = normalizeError(err)
      logger.error({ route, method, status: 500, durationMs: elapsedMs(startedAt), err: error }, 'api request')

      throw err
    }
  }
}

function elapsedMs(startedAt: number): number {
  return Math.round(performance.now() - startedAt)
}
