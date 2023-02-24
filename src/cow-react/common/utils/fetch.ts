import { backOff, BackoffOptions } from "exponential-backoff"


// See config in https://www.npmjs.com/package/@insertish/exponential-backoff
const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  numOfAttempts: 10,
  maxDelay: Infinity,
  jitter: 'none',
}

export function fetchWithBackoff(input: RequestInfo | URL, init?: RequestInit, backoffOptions?: BackoffOptions): Promise<Response> {

  if (backoffOptions) {
    return backOff(() => fetch(input, init), {...DEFAULT_BACKOFF_OPTIONS, ...backoffOptions})
  }

  return fetch(input, init)
}