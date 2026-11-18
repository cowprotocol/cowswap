import Fastify, { type FastifyInstance } from 'fastify'

import { CanvasState } from './canvas.js'
import { ClaimService } from './claims.js'
import { registerCors } from './http.js'
import { RateLimiter } from './rateLimit.js'
import { registerClaimRoutes } from './routes/claims.js'
import { registerReadRoutes } from './routes/read.js'
import { registerWriteRoutes } from './routes/write.js'
import { DrawVerifier } from './verify.js'
import { WsHub } from './ws.js'

import type { Config } from './config.js'
import type { ServerContext } from './context.js'
import type { Store } from './store.js'

export interface BuiltServer {
  app: FastifyInstance
  ctx: ServerContext
  /** Stop accepting work and release timers and sockets. Does not close the store. */
  close: () => Promise<void>
}

/** Wire the whole HTTP/WS server without binding a port, so it can be tested in-process. */
export async function buildServer(
  config: Config,
  store: Store,
  options: { logger?: boolean } = {},
): Promise<BuiltServer> {
  const claims = new ClaimService(config, store)
  if (!claims.isConfigured()) {
    throw new Error('MINT and a treasury key are required unless DEV_INSECURE is set.')
  }

  const app = Fastify({ logger: options.logger ?? true, bodyLimit: 8 * 1024 * 1024, trustProxy: true })
  registerCors(app, config.corsOrigins)

  const ctx: ServerContext = {
    config,
    store,
    claims,
    canvas: new CanvasState(store),
    verifier: new DrawVerifier(config, store),
    hub: new WsHub(app, {
      path: '/v1/ws',
      maxClients: config.wsMaxClients,
      heartbeatMs: config.wsHeartbeatMs,
      allowedOrigins: config.corsOrigins,
    }),
    writeLimiter: new RateLimiter(config.rateLimitPerMinute),
    readLimiter: new RateLimiter(config.rateLimitPerMinute * 10),
  }

  registerReadRoutes(app, ctx)
  registerWriteRoutes(app, ctx)
  registerClaimRoutes(app, ctx)

  return {
    app,
    ctx,
    close: async () => {
      ctx.hub.close()
      ctx.writeLimiter.stop()
      ctx.readLimiter.stop()
      await app.close()
    },
  }
}
