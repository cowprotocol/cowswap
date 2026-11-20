import {
  formatApproximateBatchCountdown,
  formatAuctionCountdown,
  formatBatchCountdown,
} from './formatCowBatchCountdown'

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

describe('formatApproximateBatchCountdown', () => {
  it('ceils to whole minutes above a minute', () => {
    expect(formatApproximateBatchCountdown(402)).toBe('7 min')
    expect(formatApproximateBatchCountdown(361)).toBe('7 min')
    expect(formatApproximateBatchCountdown(360)).toBe('6 min')
    expect(formatApproximateBatchCountdown(60)).toBe('1 min')
  })

  it('snaps to 15s buckets in the last minute', () => {
    expect(formatApproximateBatchCountdown(59)).toBe('60s')
    expect(formatApproximateBatchCountdown(46)).toBe('60s')
    expect(formatApproximateBatchCountdown(45)).toBe('45s')
    expect(formatApproximateBatchCountdown(31)).toBe('45s')
    expect(formatApproximateBatchCountdown(30)).toBe('30s')
    expect(formatApproximateBatchCountdown(16)).toBe('30s')
    expect(formatApproximateBatchCountdown(15)).toBe('15s')
    expect(formatApproximateBatchCountdown(1)).toBe('15s')
  })

  it('clamps negative values to 0s', () => {
    expect(formatApproximateBatchCountdown(-5)).toBe('0s')
  })
})
