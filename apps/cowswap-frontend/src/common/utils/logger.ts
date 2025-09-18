import { isDevelopmentEnv } from '@cowprotocol/common-utils'

type LogFn = (...args: unknown[]) => void

export type Logger = {
  debug: LogFn
  info: LogFn
  warn: LogFn
  error: LogFn
}

export function createLogger(scope: string): Logger {
  const prefix = `[${scope}]`

  const debug: LogFn = (...args) => {
    if (isDevelopmentEnv()) console.debug(prefix, ...args)
  }

  const info: LogFn = (...args) => {
    if (isDevelopmentEnv()) console.info(prefix, ...args)
  }

  const warn: LogFn = (...args) => console.warn(prefix, ...args)
  const error: LogFn = (...args) => console.error(prefix, ...args)

  return { debug, info, warn, error }
}

export const logger = createLogger('App')

