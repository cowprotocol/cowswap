import 'server-only'

import pino, { type Level } from 'pino'

/** JSON lines on stdout, collected from the Vercel function logs. `LOG_LEVEL` defaults to `info` */
export const logger = pino({
  level: getLogLevel(process.env.LOG_LEVEL),
  base: { service: 'rwa-frontend', env: process.env.VERCEL_ENV ?? process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: { level: (label) => ({ level: label }) },
})

/** pino throws on an unknown level, which would fail every module that imports the logger */
export function getLogLevel(value: string | undefined): Level {
  const level = value?.trim().toLowerCase()

  return isLevel(level) ? level : 'info'
}

function isLevel(value: string | undefined): value is Level {
  return value !== undefined && Object.hasOwn(pino.levels.values, value)
}
