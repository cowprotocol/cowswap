import { getTokenAccountOwner } from '../../../api/solanaOrderbook/getTokenAccountOwner'

const TOKEN_ACCOUNT = 'G5F2C2cdSnnx63Bf48xjJBxKfQqV2XKMwWo3JyuC4kWt'
const OWNER = '2c1E71jPXqgM8nJXiQpCEwGhXSVA8GTN4a1qTS1ibyLa'

const fetchMock = jest.fn()
global.fetch = fetchMock as unknown as typeof fetch

function jsonResponse(body: unknown): Promise<Response> {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)
}

describe('getTokenAccountOwner', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it('reads the owner off the token account', async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse({ result: { value: { data: { parsed: { type: 'account', info: { owner: OWNER } } } } } }),
    )

    expect(await getTokenAccountOwner(TOKEN_ACCOUNT)).toBe(OWNER)
  })

  it('returns null when the account does not exist', async () => {
    fetchMock.mockReturnValueOnce(jsonResponse({ result: { value: null } }))

    expect(await getTokenAccountOwner(TOKEN_ACCOUNT)).toBeNull()
  })

  it('returns null when the address is a mint rather than a token account', async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse({ result: { value: { data: { parsed: { type: 'mint', info: { decimals: 6 } } } } } }),
    )

    expect(await getTokenAccountOwner(TOKEN_ACCOUNT)).toBeNull()
  })

  // The caller shows the token account as a fallback, which would be wrong for a request that never landed.
  it('throws when the endpoint is unreachable', async () => {
    fetchMock.mockReturnValueOnce(Promise.resolve({ ok: false, status: 503 } as Response))

    await expect(getTokenAccountOwner(TOKEN_ACCOUNT)).rejects.toThrow('503')
  })
})
