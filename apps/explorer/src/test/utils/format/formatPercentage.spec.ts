import BigNumber from 'bignumber.js'

import { mockNumberLocale } from '../../mockNumberLocale'

const CASES = [
  { given: '0', result: '0%' },
  { given: '0.000000000001', result: '<0.01%' },
  { given: '0.00001', result: '<0.01%' },
  { given: '0.0001', result: '0.01%' },
  { given: '0.00015', result: '0.01%' },
  { given: '0.0012', result: '0.12%' },
  { given: '0.0123', result: '1.23%' },
  { given: '0.1234', result: '12.34%' },
  { given: '0.123456789', result: '12.34%' },
  { given: '0.5', result: '50%' },
  { given: '0.9', result: '90%' },
  { given: '0.99', result: '99%' },
  { given: '0.999', result: '99.9%' },
  { given: '0.9999', result: '99.99%' },
  { given: '0.99999', result: '>99.99%' },
  { given: '0.999999999999999', result: '>99.99%' },
]

const LOCALES = ['de-DE', 'ru-RU', 'fr-FR', 'en-US', 'ar-SA']

describe('formatPercentage', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  CASES.forEach(({ given, result }) => {
    LOCALES.forEach((locale) => {
      it(`Given ${given} (${locale}), when formats percentage, then expect ${result}`, async () => {
        mockNumberLocale(locale)
        const { formatPercentage } = await import('../../../utils') // should import after locale mock
        const percentage = formatPercentage(new BigNumber(given))
        expect(percentage).toEqual(result)
      })
    })
  })
})
