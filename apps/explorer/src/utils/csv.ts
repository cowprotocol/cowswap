import { logDebug } from 'utils/miscellaneous'

export type CsvColumns = Record<string, string>

export function escapeValue(value: string): string {
  // " is a string delimeter
  // if already included in e.g. symbol
  // must be replaced by double ""
  value = value.replace(/"/g, '""')

  // if there's a field delimeter comma in e.g. symbol or date
  // need to enclose whole string in quotes
  if (value.includes(',')) value = `"${value}"`
  return value
}

interface ToCsvParams<T, R extends CsvColumns> {
  data: T[]
  transformer: (item: T) => R
}

/**
 * Util function that transforms given data and transformer function into a csv string,
 * taking care of escaping and error handling
 *
 * `data` is a list of items to be converted to CSV by `transformer`
 * `transformer` is a function that receives the item and returns an object
 *
 * Column order will be given by key order on returned object from transformer.
 *
 * When no data, empty string is returned
 */
export function toCsv<T, R extends CsvColumns>({ data, transformer }: ToCsvParams<T, R>): string {
  if (data.length === 0) {
    return ''
  }

  // Extract first item from list, to avoid redoing a potentially expensive operation twice
  const [firstDataItem, ...remainingData] = data

  // Extract headers from first item
  const transformed = transformer(firstDataItem)
  const headers = Object.keys(transformed).join(',')
  // Since we already got it, use first row
  const firstRow = Object.values(transformed).map(escapeValue).join(',')

  return remainingData
    .reduce<string[]>(
      (acc, item) => {
        try {
          // Extract values from transformed data. We already have the keys.
          const values = Object.values(transformer(item))
          // Build csv row, escaping each value as needed
          const csvRow = values.map(escapeValue).join(',')

          acc.push(csvRow)

          return acc
        } catch (e) {
          logDebug(`[utils:toCsv] Not able to transform into csv: ${item}`, e)
          return acc
        }
      },
      // Start off with headers and first row
      [headers, firstRow],
    )
    .join('\n')
}
