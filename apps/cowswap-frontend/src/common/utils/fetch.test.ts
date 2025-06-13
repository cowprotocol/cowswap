import fetchMock from 'jest-fetch-mock'

import { fetchWithRateLimit } from './fetch'

fetchMock.enableMocks()
// jest.useFakeTimers('modern')
// jest.spyOn(global, 'setTimeout')
// jest.useFakeTimers()

const URL = 'https://cow.fi'
const ERROR_MESSAGE = '💣💥 Booom!'

const OK_RESPONSE = {
  status: 200,
  ok: true,
  json: () => Promise.resolve({}),
}

beforeEach(() => {
  fetchMock.mockClear()
})

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function mockAndFailUntilAttempt(attempt: number) {
  let count = 0

  fetchMock.mockImplementation((() => {
    count++
    return count >= attempt ? Promise.resolve(OK_RESPONSE) : Promise.reject(ERROR_MESSAGE)
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any)
}

// We use fetchWithRateLimit instead of fetchWithBackoff, since that is just a default config version of fetchWithBackoff
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fetchUrlWithBackoff = (attempts: number) =>
  fetchWithRateLimit({ backoff: { numOfAttempts: attempts } })(URL, undefined)

describe('Fetch with backoff', () => {
  it('No re-attempt if SUCCESS', async () => {
    // GIVEN: A working API
    mockAndFailUntilAttempt(0)

    // WHEN: Fetch url (backoff up to 10 attempts)
    const result = await fetchUrlWithBackoff(10)

    // THEN: Only one request is needed (no need to re-attempt)
    expect(fetchMock).toBeCalledTimes(1)

    // THEN: The result is OK
    expect(result).toBe(OK_RESPONSE)
  })

  it('3 re-attempts if FAILS 3 times and then SUCCEED', async () => {
    // GIVEN: An API which fails 3 tiems, and then succeeds
    mockAndFailUntilAttempt(3)

    // WHEN: Fetch url (backoff up to 5 attempts)
    const result = await fetchUrlWithBackoff(5)

    // THEN: Only one request is needed
    expect(fetchMock).toBeCalledTimes(3)

    // THEN: The result is OK
    expect(result).toBe(OK_RESPONSE)
  })

  it('SUCCEED in the last attempt', async () => {
    // GIVEN: A API which fails 50 times
    mockAndFailUntilAttempt(3)

    // WHEN: Fetch url (backoff up to 3 attempts)
    const result = await fetchUrlWithBackoff(3)

    // THEN: We only call fetch 3 times
    expect(fetchMock).toBeCalledTimes(3)

    // THEN: The result is OK
    expect(result).toBe(OK_RESPONSE)
  })

  it("Don't reattempt after FAILING the MAXIMUM number of times", async () => {
    // GIVEN: A API which fails 50 times
    mockAndFailUntilAttempt(50)

    // WHEN: Fetch url (backoff up to 3 attempts)
    const fetchPromise = fetchUrlWithBackoff(3)

    // THEN: The result is ERROR
    await expect(fetchPromise).rejects.toBe(ERROR_MESSAGE)

    // THEN: We only call fetch 3 times
    expect(fetchMock).toBeCalledTimes(3)
  })
})
