import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createBalancesWatcherSession } from './createSession'
import { BalancesWatcherApiError } from './types'

const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const BASE_URL = 'https://watcher.example'

function mockFetchResponse(status: number, body: unknown): jest.SpyInstance {
  const init: ResponseInit = {
    status,
    headers: { 'Content-Type': 'application/json' },
  }
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  return jest.spyOn(global, 'fetch').mockResolvedValue(new Response(text, init))
}

describe('createBalancesWatcherSession', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('POSTs to /{chainId}/sessions/{owner} with the request body and resolves on 2xx', async () => {
    const fetchSpy = mockFetchResponse(200, '')

    await createBalancesWatcherSession({
      chainId: SupportedChainId.MAINNET,
      owner: OWNER,
      body: { tokensListsUrls: ['https://lists.example/uni.json'], customTokens: ['0xabc'] },
      baseUrl: BASE_URL,
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [calledUrl, calledInit] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(calledUrl).toBe(`${BASE_URL}/1/sessions/${OWNER}`)
    expect(calledInit.method).toBe('POST')
    expect(JSON.parse(calledInit.body as string)).toEqual({
      tokensListsUrls: ['https://lists.example/uni.json'],
      customTokens: ['0xabc'],
    })
  })

  it('strips a trailing slash from baseUrl', async () => {
    const fetchSpy = mockFetchResponse(200, '')

    await createBalancesWatcherSession({
      chainId: SupportedChainId.GNOSIS_CHAIN,
      owner: OWNER,
      body: { tokensListsUrls: [], customTokens: ['0xabc'] },
      baseUrl: `${BASE_URL}/`,
    })

    const [calledUrl] = fetchSpy.mock.calls[0]
    expect(calledUrl).toBe(`${BASE_URL}/100/sessions/${OWNER}`)
  })

  it('throws BalancesWatcherApiError with code+status when the server returns the JSON envelope', async () => {
    mockFetchResponse(400, { code: 400, message: 'Bad request: tokens_lists_urls && custom_tokens are empty' })

    await expect(
      createBalancesWatcherSession({
        chainId: SupportedChainId.MAINNET,
        owner: OWNER,
        body: { tokensListsUrls: [], customTokens: [] },
        baseUrl: BASE_URL,
      }),
    ).rejects.toMatchObject({
      name: 'BalancesWatcherApiError',
      status: 400,
      code: 400,
      message: 'Bad request: tokens_lists_urls && custom_tokens are empty',
    })
  })

  it('falls back to {code: status, message: raw body} when the error body is not JSON', async () => {
    mockFetchResponse(503, 'upstream unreachable')

    const error = await createBalancesWatcherSession({
      chainId: SupportedChainId.MAINNET,
      owner: OWNER,
      body: { tokensListsUrls: ['https://lists.example/x.json'], customTokens: [] },
      baseUrl: BASE_URL,
    }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(BalancesWatcherApiError)
    expect(error).toMatchObject({ status: 503, code: 503, message: 'upstream unreachable' })
  })

  it('surfaces 404 chain mismatch responses', async () => {
    mockFetchResponse(404, { code: 404, message: 'Not found' })

    await expect(
      createBalancesWatcherSession({
        chainId: SupportedChainId.MAINNET,
        owner: OWNER,
        body: { tokensListsUrls: ['https://lists.example/x.json'], customTokens: [] },
        baseUrl: BASE_URL,
      }),
    ).rejects.toMatchObject({ status: 404, code: 404 })
  })
})
