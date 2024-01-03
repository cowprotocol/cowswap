export * from './data'
import { DATE } from './data'
import BN from 'bn.js'

export function mockTimes(dateToUse: Date = DATE): void {
  jest.spyOn(global.Date, 'now').mockImplementation(() => dateToUse.valueOf())
}

/**
 * Clones balances or allowances objects
 *
 * To avoid issues due to values being kept across different tests
 * due to value referencing
 *
 * @param obj Balances or Allowances obj
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clone(obj: any): any {
  if (!obj) {
    return obj
  }
  return Object.keys(obj).reduce((newObj, key) => {
    newObj[key] = obj[key] instanceof BN ? obj[key].clone() : clone(obj[key])
    return newObj
  }, {})
}
