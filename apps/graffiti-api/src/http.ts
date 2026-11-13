import crypto from 'node:crypto'

import type { Config } from './config.js'
import type { RateLimiter } from './rateLimit.js'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

/** Admin auth. Fails closed: no ADMIN_TOKEN configured means no access. */
export function isAdminAllowed(config: Config, req: FastifyRequest, reply: FastifyReply): boolean {
  if (!config.adminToken) {
    reply.code(503).send({ ok: false, reason: 'admin endpoints disabled: ADMIN_TOKEN not configured' })
    return false
  }
  if (!safeEqual(req.headers.authorization ?? '', `Bearer ${config.adminToken}`)) {
    reply.code(401).send({ ok: false, reason: 'unauthorized' })
    return false
  }
  return true
}

/** Replies 429 and returns true when the caller is over its budget. */
export function isRateLimited(limiter: RateLimiter, req: FastifyRequest, reply: FastifyReply): boolean {
  const key = req.ip || 'unknown'
  if (limiter.take(key)) return false

  reply
    .code(429)
    .header('retry-after', String(limiter.retryAfter(key)))
    .send({ ok: false, reason: 'rate limit exceeded' })
  return true
}

/** Allow the configured origins; `*` only when explicitly configured. */
export function registerCors(app: FastifyInstance, origins: string[]): void {
  const allowAny = origins.includes('*')

  app.addHook('onRequest', async (req, reply) => {
    const origin = req.headers.origin
    if (allowAny) {
      reply.header('access-control-allow-origin', '*')
    } else if (origin && origins.includes(origin)) {
      reply.header('access-control-allow-origin', origin)
      reply.header('vary', 'origin')
    }
    reply.header('access-control-allow-headers', 'content-type,authorization')
    reply.header('access-control-allow-methods', 'GET,POST,OPTIONS')
    if (req.method === 'OPTIONS') return reply.send()
  })
}

/** Constant-time compare, so tokens cannot be probed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}
