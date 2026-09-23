import { getSplTokenInfo } from '../../../api/solanaOrderbook/getSplTokenInfo'

const MINT = 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr'
const SHORTENED = 'J3NK…3KFr'

const fetchMock = jest.fn()
global.fetch = fetchMock as unknown as typeof fetch

function jsonResponse(body: unknown): Promise<Response> {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)
}

describe('getSplTokenInfo', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it('reads decimals off the mint account', async () => {
    fetchMock.mockReturnValueOnce(jsonResponse({ result: { value: { data: { parsed: { info: { decimals: 8 } } } } } }))

    expect(await getSplTokenInfo(MINT)).toEqual({
      address: MINT,
      decimals: 8,
      symbol: SHORTENED,
      name: SHORTENED,
    })
  })

  it('returns null when the account is not a mint', async () => {
    fetchMock.mockReturnValueOnce(jsonResponse({ result: { value: null } }))

    expect(await getSplTokenInfo(MINT)).toBeNull()
  })

  // The caller retries on a throw, so a transport failure must not look like "no such mint".
  it('throws when the endpoint is unreachable', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ ok: false, status: 503 } as Response))

    await expect(getSplTokenInfo(MINT)).rejects.toThrow('503')
  })
})
