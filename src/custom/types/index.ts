export interface WithClassName {
  className?: string
}

export type Writable<T> = {
  -readonly [K in keyof T]: T[K]
}

export interface Market {
  baseToken: string
  quoteToken: string
}
