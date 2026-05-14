type CowLogLevel = 'debug' | 'info' | 'warn' | 'error'

type CowLogger = Record<CowLogLevel, (...args: unknown[]) => void>

const LOG_STYLE: Record<CowLogLevel, string> = {
  debug: 'font-weight: bold; color: #1c5dbf',
  info: 'font-weight: bold; color: #0f766e',
  warn: 'font-weight: bold; color: #b45309',
  error: 'font-weight: bold; color: #dc2626',
}

function logCow(level: CowLogLevel, scope: string, ...args: unknown[]): void {
  console[level](`%c [COW] [${scope}]`, LOG_STYLE[level], ...args)
}

export function createCowLogger(scope: string): CowLogger {
  return {
    debug: (...args) => logCow('debug', scope, ...args),
    info: (...args) => logCow('info', scope, ...args),
    warn: (...args) => logCow('warn', scope, ...args),
    error: (...args) => logCow('error', scope, ...args),
  }
}
