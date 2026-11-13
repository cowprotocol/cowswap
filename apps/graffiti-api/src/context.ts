import type { CanvasState } from './canvas.js'
import type { ClaimService } from './claims.js'
import type { Config } from './config.js'
import type { RateLimiter } from './rateLimit.js'
import type { Store } from './store.js'
import type { DrawVerifier } from './verify.js'
import type { WsHub } from './ws.js'

/** Everything a route needs, built once at startup. */
export interface ServerContext {
  config: Config
  store: Store
  canvas: CanvasState
  verifier: DrawVerifier
  claims: ClaimService
  hub: WsHub
  writeLimiter: RateLimiter
  readLimiter: RateLimiter
}
