import fetchMock from 'jest-fetch-mock'

import tokenList from 'lib/hooks/useTokenList/mockTokenList.json'

import fetchTokenList, { DEFAULT_TOKEN_LIST } from './fetchTokenList'

fetchMock.enableMocks()

describe('fetchTokenList', () => {
  let resolver: jest.Mock

  beforeEach(() => {
    fetchMock.resetMocks()
    resolver = jest.fn()
  })

  it('throws on an invalid list url', async () => {
    fetchMock.mockReject(() => Promise.reject("URL doesn't exist"))
    const url = 'https://example.com'
    await expect(fetchTokenList(url, resolver)).rejects.toThrowError(`failed to fetch list: ${url}`)
    expect(resolver).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledWith(url, { credentials: 'omit' })
  })

  it('tries to fetch an ENS address using the passed resolver', async () => {
    const url = 'example.eth'
    const contenthash = '0xD3ADB33F'
    resolver.mockResolvedValue(contenthash)
    await expect(fetchTokenList(url, resolver)).rejects.toThrow(
      `failed to translate contenthash to URI: ${contenthash}`
    )
    expect(resolver).toHaveBeenCalledWith(url)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches and validates the default token list', async () => {
    const list = tokenList
    fetchMock.mockImplementationOnce(
      () =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve(list),
        }) as any
    )
    await expect(fetchTokenList(DEFAULT_TOKEN_LIST, resolver)).resolves.toStrictEqual(list)
    expect(resolver).not.toHaveBeenCalled()
  })
})
