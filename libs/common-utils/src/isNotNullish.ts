import { Nullish } from '@cowprotocol/types'

export function isNotNullish<T>(input: Nullish<T>): input is T {
  return input !== null && input !== undefined
}
