import { loadExampleAsset } from './exampleAssets.utils'

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('../../../../../libs/common-utils/src/api-utils'),
  ...jest.requireActual('../../../../../libs/common-utils/src/errors'),
}))

describe('AI example request deadline', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('returns the original blob when the request completes', async () => {
    const blob = new Blob(['example'])
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, blob: async (): Promise<Blob> => blob } as Response)
    expect(await loadExampleAsset('/example.png')).toBe(blob)
  })

  it('aborts a fetch that never responds', async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), {
            once: true,
          })
        }),
    )
    const failure = expect(loadExampleAsset('/example.png')).rejects.toThrow('too long')
    await jest.advanceTimersByTimeAsync(10000)
    await failure
  })

  it('also aborts a response body that stops arriving', async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(
      async (_input, init) =>
        ({
          ok: true,
          blob: (): Promise<Blob> =>
            new Promise((_resolve, reject) => {
              init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), {
                once: true,
              })
            }),
        }) as Response,
    )
    const failure = expect(loadExampleAsset('/example.png')).rejects.toThrow('too long')
    await jest.advanceTimersByTimeAsync(10000)
    await failure
  })

  it('reports an unavailable example', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response)
    await expect(loadExampleAsset('/missing.png')).rejects.toThrow('could not be loaded')
  })
})
