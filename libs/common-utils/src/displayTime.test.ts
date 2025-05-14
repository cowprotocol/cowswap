import ms from 'ms'

import { displayTime } from './displayTime'

describe('displayTime', () => {
  // Test cases for default format (expandedUnits = false)
  test('should format time correctly with default format', () => {
    expect(displayTime(0)).toBe('0s')
    expect(displayTime(999)).toBe('0s') // Test for positive sub-second values in compact mode
    expect(displayTime(ms('5s'))).toBe('5s')
    expect(displayTime(ms('30s'))).toBe('30s')
    expect(displayTime(ms('1m'))).toBe('1m')
    expect(displayTime(ms('2m') + ms('5s'))).toBe('2m 5s')
    expect(displayTime(ms('1h'))).toBe('1h')
    expect(displayTime(ms('1h') + ms('30m'))).toBe('1h 30m')
    expect(displayTime(ms('2h') + ms('15m') + ms('10s'))).toBe('2h 15m 10s')
    expect(displayTime(ms('1d'))).toBe('1d')
    expect(displayTime(ms('1d') + ms('5h'))).toBe('1d 5h')
    expect(displayTime(ms('2d') + ms('10h') + ms('5m') + ms('3s'))).toBe('2d 10h 5m 3s')
  })

  // Test cases for expanded units format (expandedUnits = true)
  test('should format time correctly with expanded units', () => {
    // Less than a minute
    expect(displayTime(ms('5s'), true)).toBe('5 secs')
    expect(displayTime(ms('30s'), true)).toBe('30 secs')
    expect(displayTime(ms('59s'), true)).toBe('59 secs')

    // Exactly one minute
    expect(displayTime(ms('1m'), true)).toBe('1 min')

    // Minutes and seconds
    expect(displayTime(ms('1m') + ms('5s'), true)).toBe('1 min 5 secs')
    expect(displayTime(ms('2m') + ms('30s'), true)).toBe('2 mins 30 secs')
    expect(displayTime(125000, true)).toBe('2 mins 5 secs')
    expect(displayTime(ms('59m') + ms('59s'), true)).toBe('59 mins 59 secs')

    // Exactly one hour
    expect(displayTime(ms('1h'), true)).toBe('1 hr')

    // Hours, minutes, and seconds (aligned with new floor logic)
    expect(displayTime(ms('1h') + ms('5m'), true)).toBe('1 hr 5 mins')
    expect(displayTime(ms('1h') + ms('30m'), true)).toBe('1 hr 30 mins')
    expect(displayTime(ms('2h'), true)).toBe('2 hrs')
    expect(displayTime(ms('5h'), true)).toBe('5 hrs')

    // Coworker's example
    expect(displayTime(11720000, true)).toBe('3 hrs 15 mins 20 secs')
  })

  test('should handle edge cases with expanded units', () => {
    expect(displayTime(0, true)).toBe('0 secs')
    expect(displayTime(999, true)).toBe('0 secs')
    expect(displayTime(59999, true)).toBe('59 secs')
    expect(displayTime(3599999, true)).toBe('59 mins 59 secs')
  })
})
