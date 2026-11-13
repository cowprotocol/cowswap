import { DEFAULT_CLAIM_AMOUNT } from '../config.js'
import { isAdminAllowed, isRateLimited } from '../http.js'

import type { ServerContext } from '../context.js'
import type { FastifyInstance } from 'fastify'

export function registerClaimRoutes(app: FastifyInstance, ctx: ServerContext): void {
  registerPublicClaims(app, ctx)
  registerAdminClaims(app, ctx)
}

/** An integer from a request value, clamped to [min, max]; `def` when malformed. */
function clampInt(raw: unknown, def: number, min: number, max: number): number {
  const n = Math.floor(Number(raw ?? def))
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : def
}

function registerAdminClaims(app: FastifyInstance, ctx: ServerContext): void {
  app.post<{ Body: { n?: number; amount?: number } }>('/v1/admin/claims', async (req, reply) => {
    if (!isAdminAllowed(ctx.config, req, reply)) return reply

    const n = clampInt(req.body?.n, 1, 1, 1000)
    const amount = clampInt(req.body?.amount, DEFAULT_CLAIM_AMOUNT, 1, Number.MAX_SAFE_INTEGER)
    const codes = ctx.claims.generate(n, amount)
    return { ok: true, codes: codes.map((code) => ({ code, amount })) }
  })

  // Claims whose transfer outcome is unknown and needs an operator.
  app.get('/v1/admin/claims/failed', async (req, reply) => {
    if (!isAdminAllowed(ctx.config, req, reply)) return reply
    return { ok: true, claims: ctx.store.listFailedClaims(200) }
  })
}

function registerPublicClaims(app: FastifyInstance, ctx: ServerContext): void {
  app.get<{ Params: { code: string } }>('/v1/claim/:code', async (req, reply) => {
    if (isRateLimited(ctx.writeLimiter, req, reply)) return reply
    return ctx.claims.check(req.params.code)
  })

  app.post<{ Body: { code?: string; walletPubkey?: string } }>('/v1/claim', async (req, reply) => {
    if (isRateLimited(ctx.writeLimiter, req, reply)) return reply

    const { code, walletPubkey } = req.body ?? {}
    if (!code || !walletPubkey) return reply.code(400).send({ ok: false, reason: 'code and walletPubkey required' })

    const result = await ctx.claims.claim(code, walletPubkey)
    if (!result.ok) return reply.code(result.status).send({ ok: false, reason: result.reason })
    return { ok: true, txSignature: result.txSignature, amount: result.amount }
  })
}
