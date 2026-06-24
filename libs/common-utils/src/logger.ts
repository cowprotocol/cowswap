import { captureError } from './sentry'

export type CowLogLevel = 'debug' | 'info' | 'warn' | 'error'

export type CowLogger = Record<CowLogLevel, (...args: unknown[]) => void>

const LOG_STYLE: Record<CowLogLevel, string> = {
  debug: 'font-weight: bold; color: #6b7280',
  info: 'font-weight: bold; color: #1c5dbf',
  warn: 'font-weight: bold; color: #b45309',
  error: 'font-weight: bold; color: #dc2626',
}

function logCow(level: CowLogLevel, scope: string, ...args: unknown[]): void {
  if (process.env['NODE_ENV'] === 'test') return

  console[level](`%c[COW][${scope}]`, LOG_STYLE[level], ...args)
}

function captureCowError(scope: string, args: unknown[]): void {
  const message = typeof args[0] === 'string' ? args[0] : `${scope} error`
  const error = args.find((arg) => arg instanceof Error)

  captureError(error || new Error(message), undefined, { args }, { scope })
}

export function createCowLogger(scope: string): CowLogger {
  return {
    debug: (...args) => logCow('debug', scope, ...args),
    info: (...args) => logCow('info', scope, ...args),
    warn: (...args) => logCow('warn', scope, ...args),
    error: (...args) => {
      logCow('error', scope, ...args)
      captureCowError(scope, args)
    },
  }
}

export const logSafeApi = createCowLogger('SafeAPI')
