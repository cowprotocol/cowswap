import fastifyStatic from '@fastify/static'

import fs from 'node:fs'
import path from 'node:path'

import { buildServer } from './app.js'
import { loadConfig } from './config.js'
import { openStore } from './store.js'

import type { FastifyInstance } from 'fastify'

async function main(): Promise<void> {
  const config = loadConfig()
  const store = openStore(config.dbPath, config.allowJsonStore)
  const { app, close } = await buildServer(config, store)
  await registerStatic(app)

  let shuttingDown = false
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return
    shuttingDown = true
    app.log.info({ signal }, 'shutting down')
    await close()
    store.close()
    process.exit(0)
  }
  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))

  await app.listen({ port: config.port, host: config.host })
  app.log.info(
    {
      port: config.port,
      network: config.network,
      mint: config.mint,
      store: store.kind,
      commitment: config.verifyCommitment,
      devInsecure: config.devInsecure,
    },
    'graffiti-api up',
  )
  if (config.devInsecure) app.log.warn('DEV_INSECURE=1 — on-chain burn verification DISABLED')
}

/** Serve the built frontend (same origin → relative /v1 works, no CORS). */
async function registerStatic(app: FastifyInstance): Promise<void> {
  const staticDir = process.env.STATIC_DIR ?? ''
  if (!staticDir || !fs.existsSync(path.join(staticDir, 'index.html'))) return

  await app.register(fastifyStatic, { root: path.resolve(staticDir), prefix: '/' })
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/v1')) return reply.code(404).send({ ok: false, reason: 'not found' })
    return reply.sendFile('index.html')
  })
  app.log.info({ staticDir }, 'serving frontend')
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
