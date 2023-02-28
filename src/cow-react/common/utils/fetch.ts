import { backOff, BackoffOptions } from 'exponential-backoff'

// See config in https://www.npmjs.com/package/@insertish/exponential-backoff
const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  numOfAttempts: 10,
  maxDelay: Infinity,
  jitter: 'none',
}

/**
 *
 * @param input Request info (as in the fetch method)
 * @param init Request options (as in fetch method)
 * @param backoffOptions Backoff parameters. By default It will wait a maximum of ~102s. Wait time is 100ms * 2**(attenmpt). Not more than 10 attempts
 * @returns A promise of the request
 */
// By default, it will wait
export function fetchWithBackoff(
  input: RequestInfo | URL,
  init?: RequestInit,
  backoffOptions?: BackoffOptions
): Promise<Response> {
  return backOff(() => fetch(input, init), { ...DEFAULT_BACKOFF_OPTIONS, ...backoffOptions })
}
