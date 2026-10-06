import 'server-only'

import pino from 'pino'

/** JSON lines on stdout, collected from the Vercel function logs. `LOG_LEVEL` defaults to `info` */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { service: 'rwa-frontend', env: process.env.VERCEL_ENV ?? process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: { level: (label) => ({ level: label }) },
})
