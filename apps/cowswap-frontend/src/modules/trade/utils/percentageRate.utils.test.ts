import { Fraction } from '@cowprotocol/currency'

import { getPercentageRate, getRatePercentage } from './percentageRate.utils'

describe('getPercentageRate', () => {
  it.each([
    ['5', '2110.5'],
    ['10', '2211'],
    ['20', '2412'],
    ['2.5', '2060.25'],
    ['.5', '2020.05'],
  ])('sets a sell price %s percent above market', (percentage, expected) => {
    expect(getPercentageRate(new Fraction(2010), percentage, false)?.toFixed(2)).toBe(Number(expected).toFixed(2))
  })

  it.each([
    ['5', '1909.50'],
    ['10', '1809.00'],
    ['20', '1608.00'],
    ['2.5', '1959.75'],
  ])('sets an inverted buy price %s percent below market', (percentage, expected) => {
    const rate = getPercentageRate(new Fraction(1, 2010), percentage, true)
    expect(rate?.invert().toFixed(2)).toBe(expected)
    expect(rate?.greaterThan(new Fraction(1, 2010))).toBe(true)
  })

  it('keeps decimal arithmetic exact', () => {
    expect(getPercentageRate(new Fraction(1, 3), '0.1', false)?.equalTo(new Fraction(1001, 3000))).toBe(true)
  })

  it.each(['', '.', '0', '0.0', '-5', 'NaN', 'Infinity', '1e3', '5%', '1.2.3'])(
    'rejects invalid custom percentage %s',
    (value) => expect(getPercentageRate(new Fraction(2010), value, false)).toBeNull(),
  )

  it.each(['100', '101', '999'])('rejects a nonpositive inverted price for %s percent', (value) => {
    expect(getPercentageRate(new Fraction(1, 2010), value, true)).toBeNull()
  })

  it.each([null, new Fraction(0), new Fraction(-1)])('rejects an unavailable or nonpositive market', (market) => {
    expect(getPercentageRate(market, '5', false)).toBeNull()
  })

  it('allows sell targets over 100 percent', () => {
    expect(getPercentageRate(new Fraction(2010), '150', false)?.toFixed(0)).toBe('5025')
  })

  it.each([
    [false, '0.01', '100.01'],
    [false, '999.99', '1099.99'],
    [true, '0.01', '99.99'],
    [true, '99.99', '0.01'],
  ])('accepts boundary %s / %s', (isInverted, percentage, expected) => {
    const referenceRate = isInverted ? new Fraction(1, 100) : new Fraction(100)
    const rate = getPercentageRate(referenceRate, percentage, isInverted)
    expect((isInverted ? rate?.invert() : rate)?.toFixed(2)).toBe(expected)
  })

  it.each([false, true])('rejects percentages below the minimum when inverted=%s', (isInverted) => {
    expect(getPercentageRate(new Fraction(100), '0.009', isInverted)).toBeNull()
  })

  it.each([
    [false, '999.991'],
    [false, '1000'],
    [true, '99.991'],
    [true, '100'],
    [false, '1111111111111111'],
    [true, '1111111111111111'],
  ])('rejects percentages above the maximum %s / %s', (isInverted, percentage) => {
    expect(getPercentageRate(new Fraction(100), percentage, isInverted)).toBeNull()
  })
})

describe('getRatePercentage', () => {
  const market = new Fraction(2010)

  it.each([
    [false, '7'],
    [false, '2.5'],
    [false, '150'],
    [true, '7'],
    [true, '0.01'],
    [true, '99.99'],
  ])('round-trips a percentage when inverted=%s / %s', (isInverted, percentage) => {
    expect(getRatePercentage(market, getPercentageRate(market, percentage, isInverted), isInverted)).toBe(percentage)
  })

  it('converts a percentage above market into the equivalent percentage below the inverted market', () => {
    const rate = getPercentageRate(market, '7', false)

    expect(getRatePercentage(market, rate, true)).toBe('6.54')
  })

  it('keeps the minimum percentage when converting it to the inverted side', () => {
    const rate = getPercentageRate(market, '0.01', false)

    expect(getRatePercentage(market, rate, true)).toBe('0.01')
  })

  it('converts a percentage below the inverted market into the equivalent percentage above market', () => {
    const rate = getPercentageRate(market, '20', true)

    expect(getRatePercentage(market, rate, false)).toBe('25')
  })

  it.each([
    [true, '90.9', '998.9'],
    [true, '99', '999.99'],
    [true, '99.99', '999.99'],
    [false, '999.99', '90.91'],
  ])('caps the converted percentage inverted=%s / %s at the opposite maximum', (isInverted, percentage, expected) => {
    const rate = getPercentageRate(market, percentage, isInverted)

    expect(getRatePercentage(market, rate, !isInverted)).toBe(expected)
  })

  it.each([
    [false, new Fraction(2000)],
    [true, new Fraction(2000)],
    [false, new Fraction(2010)],
  ])('returns null when the rate is not on the expected side of market (inverted=%s)', (isInverted, rate) => {
    expect(getRatePercentage(market, rate, isInverted)).toBeNull()
  })

  it.each([
    [null, new Fraction(1)],
    [market, null],
    [new Fraction(0), new Fraction(1)],
    [market, new Fraction(0)],
  ])('returns null for unavailable rates', (referenceRate, rate) => {
    expect(getRatePercentage(referenceRate, rate, false)).toBeNull()
  })
})
