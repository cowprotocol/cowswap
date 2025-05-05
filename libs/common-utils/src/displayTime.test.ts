import ms from 'ms'

import { displayTime } from './displayTime'

describe('displayTime', () => {
  // Test cases for default format (expandedUnits = false)
  test('should format time correctly with default format', () => {
    expect(displayTime(ms('5s'))).toBe('5s')
    expect(displayTime(ms('30s'))).toBe('30s')
    expect(displayTime(ms('1m'))).toBe('1m')
    expect(displayTime(ms('2m 5s'))).toBe('2m 5s')
    expect(displayTime(ms('1h'))).toBe('1h')
    expect(displayTime(ms('1h 30m'))).toBe('1h 30m')
    expect(displayTime(ms('2h 15m 10s'))).toBe('2h 15m 10s')
    expect(displayTime(ms('1d'))).toBe('1d')
    expect(displayTime(ms('1d 5h'))).toBe('1d 5h')
    expect(displayTime(ms('2d 10h 5m 3s'))).toBe('2d 10h 5m 3s')
  })

  // Test cases for expanded units format (expandedUnits = true)
  test('should format time correctly with expanded units', () => {
    // Less than a minute
    expect(displayTime(ms('5s'), true)).toBe('5 sec')
    expect(displayTime(ms('30s'), true)).toBe('30 sec')
    expect(displayTime(ms('59s'), true)).toBe('59 sec')

    // Exactly one minute
    expect(displayTime(ms('1m'), true)).toBe('1 min')

    // Minutes and seconds
    expect(displayTime(ms('1m 5s'), true)).toBe('1 min 5 sec')
    expect(displayTime(ms('2m 30s'), true)).toBe('2 min 30 sec')
    expect(displayTime(125000, true)).toBe('2 min 5 sec') // 2 minutes and 5 seconds
    expect(displayTime(ms('59m 59s'), true)).toBe('59 min 59 sec')

    // Exactly one hour (should round to hour)
    expect(displayTime(ms('1h'), true)).toBe('1 hr')

    // Hours
    expect(displayTime(ms('1h 5m'), true)).toBe('1 hr') // Rounds up
    expect(displayTime(ms('1h 30m'), true)).toBe('2 hrs') // Rounds up
    expect(displayTime(ms('2h'), true)).toBe('2 hrs')
    expect(displayTime(ms('5h'), true)).toBe('5 hrs')
  })

  test('should handle edge cases with expanded units', () => {
    expect(displayTime(0, true)).toBe('0 sec')
    expect(displayTime(999, true)).toBe('1 sec') // Rounds up
    expect(displayTime(59999, true)).toBe('1 min') // Rounds up to 1 min
    expect(displayTime(3599999, true)).toBe('1 hr') // Rounds up to 1 hr
  })
})
