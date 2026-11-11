import path from 'node:path'
import { fileURLToPath } from 'node:url'

export interface Config {
  port: number
  host: string
  rpcUrl: string
  network: string
  mint: string | null
  treasuryKeypairPath: string | null
  treasurySecretKey: string | null
  dbPath: string
  devInsecure: boolean
  allowJsonStore: boolean
  /** Commit the image was built from; null when it was not built by CI. */
  commitHash: string | null
  adminToken: string | null
  /** Allowed CORS origins; `*` only when explicitly configured. */
  corsOrigins: string[]
  /** Max age (seconds) of an accepted draw tx, and of its memo timestamp. */
  txMaxAgeSec: number
  /** Max cells accepted in a single draw request. */
  maxCellsPerDraw: number
  /** Max cell rows returned by one GET /v1/cells page. */
  maxCellsPerPage: number
  /** Commitment used to read the burn transaction back. */
  verifyCommitment: 'confirmed' | 'finalized'
  /** How long a claim waits for its transfer to confirm before parking the code. */
  claimConfirmTimeoutMs: number
  /** Requests per minute, per IP, for the public write endpoints. */
  rateLimitPerMinute: number
  /** Max simultaneous websocket clients. */
  wsMaxClients: number
  /** Heartbeat interval (ms) for websocket liveness checks. */
  wsHeartbeatMs: number
}

const thisDir = path.dirname(fileURLToPath(import.meta.url))

/** Package root (apps/graffiti-api), works both under tsx (src/) and compiled (dist/src/). */
export const PKG_ROOT = thisDir.includes(path.join('dist', 'src'))
  ? path.resolve(thisDir, '..', '..')
  : path.resolve(thisDir, '..')

function bool(name: string): boolean {
  return process.env[name] === '1' || process.env[name]?.toLowerCase() === 'true'
}

function list(name: string): string[] {
  const v = process.env[name]
  if (!v) return []
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function num(name: string, def: number): number {
  const v = process.env[name]
  if (v === undefined || v === '') return def
  const n = Number(v)
  return Number.isFinite(n) ? n : def
}

/** Clusters where real value is at stake and insecure modes are forbidden. */
const PRODUCTION_NETWORKS = new Set(['mainnet', 'mainnet-beta'])

export function loadConfig(): Config {
  const network = text('NETWORK', 'devnet')
  const devInsecure = bool('DEV_INSECURE')
  const allowJsonStore = bool('ALLOW_JSON_STORE')
  const corsOrigins = list('CORS_ORIGINS')

  assertSafeForProduction({ network, devInsecure, allowJsonStore, corsOrigins })

  return {
    port: num('PORT', 3199),
    host: text('HOST', '0.0.0.0'),
    rpcUrl: text('RPC_URL', 'https://api.devnet.solana.com'),
    network,
    mint: optional('MINT'),
    treasuryKeypairPath: optional('TREASURY_KEYPAIR'),
    treasurySecretKey: optional('TREASURY_SECRET_KEY'),
    dbPath: text('GRAFFITI_DB', path.resolve(PKG_ROOT, 'data', 'graffiti.db')),
    devInsecure,
    allowJsonStore,
    commitHash: optional('COMMIT_HASH'),
    adminToken: optional('ADMIN_TOKEN'),
    corsOrigins: corsOrigins.length > 0 ? corsOrigins : ['*'],
    verifyCommitment: process.env.VERIFY_COMMITMENT === 'confirmed' ? 'confirmed' : 'finalized',
    ...loadLimits(),
  }
}

/** Refuse to start in a configuration that is unsafe where real value is at stake. */
function assertSafeForProduction(opts: {
  network: string
  devInsecure: boolean
  allowJsonStore: boolean
  corsOrigins: string[]
}): void {
  if (!isProductionEnv(opts.network)) return

  // DEV_INSECURE disables on-chain burn verification entirely: anyone could
  // paint for free. Refuse to start rather than let a stray env var ship it.
  if (opts.devInsecure) {
    throw new Error(
      `DEV_INSECURE is set with NETWORK=${opts.network}/NODE_ENV=${process.env.NODE_ENV}; ` +
        `refusing to start with burn verification disabled.`,
    )
  }
  if (opts.allowJsonStore) {
    throw new Error(`ALLOW_JSON_STORE is set with NETWORK=${opts.network}; the JSON store is dev only.`)
  }
  if (opts.corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must list the allowed origins in production.')
  }
}

function isProductionEnv(network: string): boolean {
  return PRODUCTION_NETWORKS.has(network) || process.env.NODE_ENV === 'production'
}

function loadLimits(): Pick<
  Config,
  | 'txMaxAgeSec'
  | 'maxCellsPerDraw'
  | 'maxCellsPerPage'
  | 'rateLimitPerMinute'
  | 'wsMaxClients'
  | 'wsHeartbeatMs'
  | 'claimConfirmTimeoutMs'
> {
  return {
    txMaxAgeSec: num('TX_MAX_AGE_SEC', 300),
    // Past blockhash expiry (~150 blocks), so a transfer still unlanded here cannot land later.
    claimConfirmTimeoutMs: num('CLAIM_CONFIRM_TIMEOUT_MS', 75_000),
    maxCellsPerDraw: num('MAX_CELLS_PER_DRAW', 20000),
    maxCellsPerPage: num('MAX_CELLS_PER_PAGE', 50000),
    rateLimitPerMinute: num('RATE_LIMIT_PER_MINUTE', 60),
    wsMaxClients: num('WS_MAX_CLIENTS', 2000),
    wsHeartbeatMs: num('WS_HEARTBEAT_MS', 30000),
  }
}

function optional(name: string): string | null {
  return process.env[name] || null
}

function text(name: string, def: string): string {
  return process.env[name] || def
}

// Rectangular wall (landscape — iPads/laptops). All geometry is
// ENV-parametrizable so a new canvas is a config change, not a code change.
//
// Sized so a full spend of every outstanding code covers ~60% of the wall (see
// OPERATIONS.md). Cells are stored as absolute coordinates, so a resize after
// launch re-interprets every pixel already painted.
export const CANVAS_WIDTH = num('CANVAS_WIDTH', 3840)
export const CANVAS_HEIGHT = num('CANVAS_HEIGHT', 2160)
/** Max bounding box a single commit may cover, so nobody paints a whole-wall banner. */
export const MAX_BOX_WIDTH = num('MAX_BOX_WIDTH', 256)
export const MAX_BOX_HEIGHT = num('MAX_BOX_HEIGHT', 128)

/** Claims default amount when generating codes without an explicit amount. */
export const DEFAULT_CLAIM_AMOUNT = 5000
/**
 * Minted to the treasury by scripts/create-mint.ts. The default is a full batch of codes
 * (the 1000-per-call cap x DEFAULT_CLAIM_AMOUNT) plus an equal reserve to keep off-server.
 */
export const INITIAL_SUPPLY = num('INITIAL_SUPPLY', 10_000_000)
