export class RateLimitError extends Error {
  constructor(options?: ErrorOptions) {
    super('RateLimitError', options)
  }
}

export class UnknownCurrencyError extends Error {
  constructor(options?: ErrorOptions) {
    super('UnknownCurrencyError', options)
  }
}

export class UnsupportedPlatformError extends Error {
  constructor(options?: ErrorOptions) {
    super('UnsupportedPlatformError', options)
  }
}
