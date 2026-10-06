import { getLogLevel } from './logger'

describe('getLogLevel', () => {
  it('accepts pino levels in any case', () => {
    expect(getLogLevel('debug')).toBe('debug')
    expect(getLogLevel(' WARN ')).toBe('warn')
  })

  it('falls back to info for a missing or unknown level', () => {
    expect(getLogLevel(undefined)).toBe('info')
    expect(getLogLevel('')).toBe('info')
    expect(getLogLevel('warning')).toBe('info')
    expect(getLogLevel('toString')).toBe('info')
  })
})
