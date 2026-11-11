import { MAX_BOX_HEIGHT, MAX_BOX_WIDTH } from '../config.js'
import { isRateLimited } from '../http.js'
import { encodePng } from '../png.js'

import type { ServerContext } from '../context.js'
import type { FastifyInstance } from 'fastify'

/** Cached PNG render, invalidated by the canvas revision counter. */
interface PngCache {
  version: number
  body: Buffer
  etag: string
}

export function registerReadRoutes(app: FastifyInstance, ctx: ServerContext): void {
  app.get('/health', async () => ({ ok: true, store: ctx.store.kind, seq: ctx.canvas.seq }))

  app.get('/v1/info', async () => ({
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    maxBoxWidth: MAX_BOX_WIDTH,
    maxBoxHeight: MAX_BOX_HEIGHT,
    maxCellsPerDraw: ctx.config.maxCellsPerDraw,
    mint: ctx.config.mint,
    treasury: ctx.claims.treasuryPubkey(),
    network: ctx.config.network,
    devInsecure: ctx.config.devInsecure,
    commit: ctx.config.commitHash,
  }))

  app.get('/v1/stats', async () => ({ paintersOnline: ctx.hub.paintersOnline() }))

  registerCanvasPng(app, ctx)
  registerCells(app, ctx)
}

/** A non-negative integer from a query value, or 0 when absent or malformed. */
function nonNegativeInt(raw: unknown): number {
  const n = Number.parseInt(String(raw ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function registerCanvasPng(app: FastifyInstance, ctx: ServerContext): void {
  let cache: PngCache | null = null

  app.get('/v1/canvas.png', async (req, reply) => {
    if (isRateLimited(ctx.readLimiter, req, reply)) return reply

    // Re-encoding a multi-megabyte buffer per request blocks the event loop,
    // so render once per canvas revision and serve the cached bytes.
    if (!cache || cache.version !== ctx.canvas.version) {
      const body = encodePng(ctx.canvas.width, ctx.canvas.height, ctx.canvas.buf)
      cache = { version: ctx.canvas.version, body, etag: `W/"canvas-${ctx.canvas.version}"` }
    }
    if (req.headers['if-none-match'] === cache.etag) return reply.code(304).send()

    reply.type('image/png')
    reply.header('etag', cache.etag)
    reply.header('cache-control', 'no-cache')
    return reply.send(cache.body)
  })
}

function registerCells(app: FastifyInstance, ctx: ServerContext): void {
  app.get('/v1/cells', async (req, reply) => {
    if (isRateLimited(ctx.readLimiter, req, reply)) return reply

    const query = req.query as { since?: string; limit?: string }
    const since = nonNegativeInt(query.since)
    const requested = nonNegativeInt(query.limit)
    const limit = requested > 0 ? Math.min(requested, ctx.config.maxCellsPerPage) : ctx.config.maxCellsPerPage

    const rows = ctx.store.getCellsSince(since, limit)
    return {
      seq: rows.length > 0 ? rows[rows.length - 1].seq : since,
      cells: rows.map((r) => [r.x, r.y, r.rgb]),
      // The client must keep paging while this is true, or it will render a
      // partial wall and believe it is current.
      hasMore: rows.length === limit,
    }
  })
}
