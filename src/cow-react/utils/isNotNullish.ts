import { Nullish } from '@cow/types'

export function isNotNullish<T>(input: Nullish<T>): input is T {
  return input !== null && input !== undefined
}
