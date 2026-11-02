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

  // Token-2022 carries name and symbol in the mint account itself, in the same response decimals
  // come from — pump.fun mints are the common case.
  it('reads the name and symbol off a Token-2022 metadata extension', async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        result: {
          value: {
            data: {
              parsed: {
                info: {
                  decimals: 6,
                  extensions: [
                    { extension: 'metadataPointer', state: { authority: null } },
                    { extension: 'tokenMetadata', state: { name: 'FartCow-in', symbol: 'FARTCOW' } },
                  ],
                },
              },
            },
          },
        },
      }),
    )

    expect(await getSplTokenInfo(MINT)).toEqual({
      address: MINT,
      decimals: 6,
      symbol: 'FARTCOW',
      name: 'FartCow-in',
    })
  })

  it('falls back to the shortened mint when the metadata extension is blank', async () => {
    fetchMock.mockReturnValueOnce(
      jsonResponse({
        result: {
          value: {
            data: {
              parsed: {
                info: {
                  decimals: 6,
                  extensions: [{ extension: 'tokenMetadata', state: { name: '', symbol: '' } }],
                },
              },
            },
          },
        },
      }),
    )

    expect(await getSplTokenInfo(MINT)).toEqual({
      address: MINT,
      decimals: 6,
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

  // A JSON-RPC error arrives under HTTP 200, so the status alone does not catch it.
  it('throws when the endpoint answers with a JSON-RPC error', async () => {
    fetchMock.mockReturnValueOnce(jsonResponse({ error: { message: 'Node is behind by 500 slots' } }))

    await expect(getSplTokenInfo(MINT)).rejects.toThrow('Node is behind by 500 slots')
  })
})
