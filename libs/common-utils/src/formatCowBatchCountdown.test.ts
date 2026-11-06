import { formatAuctionCountdown, formatBatchCountdown } from './formatCowBatchCountdown'

describe('formatAuctionCountdown', () => {
  it('pads MM:SS', () => {
    expect(formatAuctionCountdown(402)).toBe('06:42')
    expect(formatAuctionCountdown(5)).toBe('00:05')
  })
})

describe('formatBatchCountdown', () => {
  it('formats minutes and seconds', () => {
    expect(formatBatchCountdown(402)).toBe('6m 42s')
  })

  it('formats seconds only under a minute', () => {
    expect(formatBatchCountdown(42)).toBe('42s')
  })

  it('clamps negative values to 0s', () => {
    expect(formatBatchCountdown(-5)).toBe('0s')
  })
})
