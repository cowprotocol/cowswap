import { getPaddedDeadlineParts } from './getPaddedDeadlineParts.utils'

describe('getPaddedDeadlineParts()', () => {
  it('pads units to two digits and keeps trailing zeros', () => {
    // 7h 0m 0s
    expect(getPaddedDeadlineParts(7 * 60 * 60)).toEqual([
      { unit: 'h', value: 7, label: '07h', isSignificant: true },
      { unit: 'm', value: 0, label: '00m', isSignificant: false },
      { unit: 's', value: 0, label: '00s', isSignificant: false },
    ])
  })

  it('keeps minutes when they are non-zero', () => {
    // 7h 30m 0s
    expect(getPaddedDeadlineParts(7 * 60 * 60 + 30 * 60)).toEqual([
      { unit: 'h', value: 7, label: '07h', isSignificant: true },
      { unit: 'm', value: 30, label: '30m', isSignificant: true },
      { unit: 's', value: 0, label: '00s', isSignificant: false },
    ])
  })

  it('pads single-digit minutes when seconds are present', () => {
    const years = 39
    const months = 11
    const days = 14
    const hours = 18
    const minutes = 4
    const secs = 30
    const oneDaySeconds = 24 * 60 * 60
    const oneYearSeconds = oneDaySeconds * 365
    const oneMonthSeconds = oneYearSeconds / 12
    const seconds =
      years * oneYearSeconds + months * oneMonthSeconds + days * oneDaySeconds + hours * 60 * 60 + minutes * 60 + secs

    expect(getPaddedDeadlineParts(seconds)).toEqual([
      { unit: 'y', value: 39, label: '39y', isSignificant: true },
      { unit: 'mo', value: 11, label: '11mo', isSignificant: true },
      { unit: 'd', value: 14, label: '14d', isSignificant: true },
      { unit: 'h', value: 18, label: '18h', isSignificant: true },
      { unit: 'm', value: 4, label: '04m', isSignificant: true },
      { unit: 's', value: 30, label: '30s', isSignificant: true },
    ])
  })

  it('keeps middle zero units between significant values', () => {
    // 9mo 18d 0h 9m
    const oneDaySeconds = 24 * 60 * 60
    const oneYearSeconds = oneDaySeconds * 365
    const oneMonthSeconds = oneYearSeconds / 12
    const seconds = 9 * oneMonthSeconds + 18 * oneDaySeconds + 9 * 60

    expect(getPaddedDeadlineParts(seconds)).toEqual([
      { unit: 'mo', value: 9, label: '09mo', isSignificant: true },
      { unit: 'd', value: 18, label: '18d', isSignificant: true },
      { unit: 'h', value: 0, label: '00h', isSignificant: false },
      { unit: 'm', value: 9, label: '09m', isSignificant: true },
      { unit: 's', value: 0, label: '00s', isSignificant: false },
    ])
  })

  it('keeps zero hours in the middle for large hour inputs', () => {
    // 7008h 9m — months/days absorb whole hours; remaining minutes must not drop 00h
    const seconds = 7008 * 60 * 60 + 9 * 60
    const labels = getPaddedDeadlineParts(seconds).map(({ label }) => label)

    expect(labels.join(' ')).toBe('09mo 18d 06h 09m 00s')
  })

  it('trims insignificant leading units only', () => {
    // 1d 0h 0m 0s
    expect(getPaddedDeadlineParts(24 * 60 * 60)).toEqual([
      { unit: 'd', value: 1, label: '01d', isSignificant: true },
      { unit: 'h', value: 0, label: '00h', isSignificant: false },
      { unit: 'm', value: 0, label: '00m', isSignificant: false },
      { unit: 's', value: 0, label: '00s', isSignificant: false },
    ])
  })

  it('includes larger units when present', () => {
    const years = 79
    const months = 10
    const days = 27
    const hours = 16
    const oneDaySeconds = 24 * 60 * 60
    const oneYearSeconds = oneDaySeconds * 365
    const oneMonthSeconds = oneYearSeconds / 12
    const seconds = years * oneYearSeconds + months * oneMonthSeconds + days * oneDaySeconds + hours * 60 * 60

    expect(getPaddedDeadlineParts(seconds)).toEqual([
      { unit: 'y', value: 79, label: '79y', isSignificant: true },
      { unit: 'mo', value: 10, label: '10mo', isSignificant: true },
      { unit: 'd', value: 27, label: '27d', isSignificant: true },
      { unit: 'h', value: 16, label: '16h', isSignificant: true },
      { unit: 'm', value: 0, label: '00m', isSignificant: false },
      { unit: 's', value: 0, label: '00s', isSignificant: false },
    ])
  })

  it('falls back to seconds when duration is zero', () => {
    expect(getPaddedDeadlineParts(0)).toEqual([{ unit: 's', value: 0, label: '00s', isSignificant: false }])
  })
})
