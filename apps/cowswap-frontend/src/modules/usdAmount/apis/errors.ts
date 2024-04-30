export class RateLimitError extends Error {
  constructor() {
    super('RateLimitError')
  }
}

export class UnknownCurrencyError extends Error {
  constructor() {
    super('UnknownCurrencyError')
  }
}
