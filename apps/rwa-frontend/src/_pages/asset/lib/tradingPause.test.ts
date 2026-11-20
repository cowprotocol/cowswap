import { getTradingPauseMessage } from './tradingPause'

const PAUSE = { issuer: 'xStocks', start: '2026-10-28T00:15:00.000Z', end: '2026-10-28T00:45:00.000Z' }

describe('getTradingPauseMessage', () => {
  it('announces an upcoming pause', () => {
    expect(getTradingPauseMessage(PAUSE, new Date('2026-10-27T12:00:00Z'), 'UTC')).toBe(
      'xStocks tokens pause trading on Oct 28, 00:15–00:45 UTC, while their balances update.',
    )
  })

  it('announces an upcoming pause on the local date', () => {
    expect(getTradingPauseMessage(PAUSE, new Date('2026-10-27T12:00:00Z'), 'America/New_York')).toBe(
      'xStocks tokens pause trading on Oct 27, 20:15–20:45 EDT, while their balances update.',
    )
  })

  it('tells when an ongoing pause ends', () => {
    expect(getTradingPauseMessage(PAUSE, new Date('2026-10-28T00:20:00Z'), 'UTC')).toBe(
      'xStocks tokens are paused until 00:45 UTC while their balances update.',
    )
    expect(getTradingPauseMessage(PAUSE, new Date('2026-10-28T00:20:00Z'), 'Asia/Tokyo')).toBe(
      'xStocks tokens are paused until 09:45 GMT+9 while their balances update.',
    )
  })

  it('is null after the pause or without one', () => {
    expect(getTradingPauseMessage(PAUSE, new Date('2026-10-28T00:45:00Z'))).toBeNull()
    expect(getTradingPauseMessage(null, new Date('2026-10-27T12:00:00Z'))).toBeNull()
  })
})
