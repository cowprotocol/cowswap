import { CsvColumns, toCsv, escapeValue } from 'utils/csv'

describe('toCsv', () => {
  interface Columns extends CsvColumns {
    times1: string
    times2: string
    times3: string
  }

  test('Order is preserved', () => {
    const data = [1, 2, 3]
    function transformer(item: number): Columns {
      return {
        times1: String(item * 1) + 'a',
        times2: String(item * 2) + 'b',
        times3: String(item * 3) + 'c',
      }
    }

    expect(toCsv({ data, transformer })).toBe('times1,times2,times3\n1a,2b,3c\n2a,4b,6c\n3a,6b,9c')
  })

  test('Returned object order dictates column order', () => {
    const data = [1, 2, 3]
    function transformer(item: number): Columns {
      return {
        times3: String(item * 3) + 'c',
        times2: String(item * 2) + 'b',
        times1: String(item * 1) + 'a',
      }
    }

    expect(toCsv({ data, transformer })).toBe('times3,times2,times1\n3c,2b,1a\n6c,4b,2a\n9c,6b,3a')
  })

  test('Empty data returns empty string', () => {
    expect(
      toCsv({
        data: [],
        transformer: (item: string): CsvColumns => ({
          item: item,
        }),
      }),
    ).toBe('')
  })

  test('Failed rows are ignored', () => {
    const data = [1, 2, 3]
    function transformer(item: number): CsvColumns {
      if (item % 2 === 0) {
        throw new Error("I don't like even numbers")
      }
      return { number: String(item), 'Is it odd?': 'yes' }
    }

    expect(toCsv({ data, transformer })).toBe('number,Is it odd?\n1,yes\n3,yes')
  })
})

describe('escapeValue', () => {
  test('no escaping needed', () => {
    const value = 'this sentence! needs not be be escaped 1902830][09.../`~@#$%^&*()'
    expect(escapeValue(value)).toBe(value)
  })

  test('escape "', () => {
    const value = 'needs escaping (")'
    expect(escapeValue(value)).toEqual('needs escaping ("")')
  })

  test('escape ,', () => {
    const value = 'no , on csv'
    expect(escapeValue(value)).toEqual('"no , on csv"')
  })
})
