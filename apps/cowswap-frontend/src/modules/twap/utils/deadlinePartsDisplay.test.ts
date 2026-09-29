import { customDeadlineToSeconds, deadlinePartsDisplay } from './deadlinePartsDisplay'

describe('deadlinePartsDisplay()', () => {
  it('uses singular labels for a single unit with longLabels', () => {
    expect(deadlinePartsDisplay(3600, true)).toBe('1 hour')
    expect(deadlinePartsDisplay(60, true)).toBe('1 minute')
    expect(deadlinePartsDisplay(1, true)).toBe('1 second')
  })

  it('uses plural labels for multiple units with longLabels', () => {
    expect(deadlinePartsDisplay(7200, true)).toBe('2 hours')
    expect(deadlinePartsDisplay(120, true)).toBe('2 minutes')
  })

  it('keeps compact labels by default', () => {
    expect(deadlinePartsDisplay(3600)).toBe('1h')
    expect(deadlinePartsDisplay(7200)).toBe('2h')
  })
})

describe('customDeadlineToSeconds()', () => {
  it('converts hours and minutes to seconds', () => {
    expect(customDeadlineToSeconds({ hours: 1, minutes: 0 })).toBe(3600)
    expect(customDeadlineToSeconds({ hours: 0, minutes: 30 })).toBe(1800)
    expect(customDeadlineToSeconds({ hours: 1, minutes: 30 })).toBe(5400)
  })
})
