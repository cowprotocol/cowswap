import { cellsDigest } from '../cellsDigest.js'
import { isRateLimited } from '../http.js'

import type { ValidCell } from '../canvas.js'
import type { ServerContext } from '../context.js'
import type { VerifyResult } from '../verify.js'
import type { FastifyInstance } from 'fastify'

interface DrawBody {
  txSignature?: string
  signature?: string
  walletPubkey?: string
  cells?: unknown
}

type DrawRequest =
  | { ok: true; cells: ValidCell[]; received: ValidCell[]; wallet: string }
  | { ok: false; reason: string }

export function registerWriteRoutes(app: FastifyInstance, ctx: ServerContext): void {
  registerDraw(app, ctx)
  registerClientErrors(app, ctx)
}

/** Everything about a draw that can be rejected without touching the chain. */
function checkDrawRequest(ctx: ServerContext, body: DrawBody): DrawRequest {
  if (!body.walletPubkey || typeof body.walletPubkey !== 'string') {
    return { ok: false, reason: 'walletPubkey required' }
  }

  const validated = ctx.canvas.validateCells(body.cells)
  if (!validated.ok) return validated

  if (validated.cells.length > ctx.config.maxCellsPerDraw) {
    return { ok: false, reason: `too many cells (max ${ctx.config.maxCellsPerDraw})` }
  }
  return { ok: true, cells: validated.cells, received: validated.received, wallet: body.walletPubkey }
}

function clip(value: unknown, max: number): string | null {
  return typeof value === 'string' ? value.slice(0, max) : null
}

function registerClientErrors(app: FastifyInstance, ctx: ServerContext): void {
  app.post<{ Body: { message?: string; phase?: string; wallet?: string; detail?: string } }>(
    '/v1/client-errors',
    async (req, reply) => {
      if (isRateLimited(ctx.writeLimiter, req, reply)) return reply

      const body = req.body ?? {}
      const message = clip(body.message, 2000)
      if (!message) return reply.code(400).send({ ok: false, reason: 'message required' })

      ctx.store.logClientError({
        message,
        phase: clip(body.phase, 100),
        wallet: clip(body.wallet, 64),
        detail: clip(body.detail, 4000),
      })
      app.log.warn({ phase: body.phase }, 'client error reported')
      return { ok: true }
    },
  )
}

function registerDraw(app: FastifyInstance, ctx: ServerContext): void {
  app.post<{ Body: DrawBody }>('/v1/draw', async (req, reply) => {
    if (isRateLimited(ctx.writeLimiter, req, reply)) return reply

    const body = req.body ?? {}
    const checked = checkDrawRequest(ctx, body)
    if (!checked.ok) return reply.code(400).send({ ok: false, reason: checked.reason })

    const result: VerifyResult = await ctx.verifier.verify({
      txSignature: body.txSignature ?? body.signature ?? null,
      walletPubkey: checked.wallet,
      costCells: checked.cells.length,
      // Over what the request carried, not the chargeable subset: that is what
      // the client hashed into its memo before the wall deduped anything.
      cellsDigest: cellsDigest(checked.received),
    })
    if (!result.ok) {
      // 409 marks "try the same burn again shortly"; 400 is terminal.
      const status = result.retryable ? 409 : 400
      return reply.code(status).send({ ok: false, reason: result.reason, retryable: result.retryable })
    }

    try {
      const seq = ctx.canvas.applyDraw(checked.cells)
      ctx.hub.broadcastDiff(seq, checked.cells)
      app.log.info({ seq, cells: checked.cells.length, wallet: checked.wallet, burned: result.burned }, 'draw applied')
      return { ok: true, seq }
    } catch (err: unknown) {
      // Hand the burn back so the client can retry rather than lose it.
      result.release()
      app.log.error({ err, wallet: checked.wallet }, 'failed to apply draw')
      return reply.code(500).send({ ok: false, reason: 'could not apply draw', retryable: true })
    }
  })
}
