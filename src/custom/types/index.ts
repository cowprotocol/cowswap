export interface WithClassName {
  className?: string
}

export type Writable<T> = {
  -readonly [K in keyof T]: T[K]
}
