import { Command } from '@cowprotocol/types'

export interface WithClassName {
  className?: string
}

export type Writable<T> = {
  -readonly [K in keyof T]: T[K]
}

export interface Market<T = string> {
  baseToken: T
  quoteToken: T
}
export interface WithCancel {
  cancel: Command
}

export interface RetryResult<T> extends WithCancel {
  promise: Promise<T>
}
