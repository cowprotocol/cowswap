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
