export type Timestamp = number // Example: 1667981900 === Nov 09 2022 14:18:20

export type Milliseconds = number // Example: 30000 === 30 sec

export type Writeable<T> = { -readonly [P in keyof T]: T[P] }
