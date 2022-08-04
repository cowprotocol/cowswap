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
  cancel: () => void
}

export interface RetryResult<T> extends WithCancel {
  promise: Promise<T>
}

export type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> & Partial<Pick<Type, Key>>
