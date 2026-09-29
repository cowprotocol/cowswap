import { captureError } from './sentry'

export type CowLogger = Record<Exclude<CowLogLevel, 'error'>, (...args: unknown[]) => void> & {
  error: (error: Error, tags?: Record<string, string>, context?: Record<string, SentryPrimitive>) => void
}

export type CowLogLevel = 'debug' | 'info' | 'warn' | 'error'
type SentryPrimitive = string | number | boolean | null

const LOG_STYLE: Record<CowLogLevel, string> = {
  debug: 'font-weight: bold; color: #6b7280',
  info: 'font-weight: bold; color: #1c5dbf',
  warn: 'font-weight: bold; color: #b45309',
  error: 'font-weight: bold; color: #dc2626',
}

export function createCowLogger(scope: string): CowLogger {
  return {
    debug: (...args) => logCow('debug', scope, ...args),
    info: (...args) => logCow('info', scope, ...args),
    warn: (...args) => logCow('warn', scope, ...args),
    error: (error, tags, context) => {
      logCow('error', scope, error, ...(tags || context ? [{ tags, context }] : []))
      captureError(error, undefined, context, { ...tags, scope })
    },
  }
}

function logCow(level: CowLogLevel, scope: string, ...args: unknown[]): void {
  if (process.env['NODE_ENV'] === 'test') return

  console[level](`%c[COW][${scope}]`, LOG_STYLE[level], ...args)
}

export const logSafeApi = createCowLogger('SafeAPI')
export const logWallet = createCowLogger('Wallet')
export const logAnalytics = createCowLogger('Analytics')
export const logTwap = createCowLogger('TWAP')
