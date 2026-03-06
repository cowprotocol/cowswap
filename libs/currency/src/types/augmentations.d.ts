export {}

declare module 'decimal.js-light' {
  interface Decimal {
    toFormat(dp: number, fmt?: object): string
  }
}

declare module 'big.js' {
  interface Big {
    toFormat(dp: number, fmt?: object): string
    toFormat(fmt?: object): string
  }
}
