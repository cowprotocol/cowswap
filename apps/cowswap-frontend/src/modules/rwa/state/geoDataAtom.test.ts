import { createStore } from 'jotai'

import { geoDataAtom, refetchGeoDataAtom } from './geoDataAtom'

describe('geoDataAtom', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('clears stale country while a refetch is loading', async () => {
    const store = createStore()
    let resolveGeoRequest: ((response: Response) => void) | undefined

    global.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveGeoRequest = resolve
        }),
    ) as typeof fetch

    store.set(geoDataAtom, {
      country: 'PT',
      isLoading: false,
      isLoaded: true,
      error: null,
    })

    const refetchPromise = store.set(refetchGeoDataAtom)

    expect(store.get(geoDataAtom)).toEqual({
      country: null,
      isLoading: true,
      isLoaded: false,
      error: null,
    })

    if (!resolveGeoRequest) {
      throw new Error('Geo request was not started')
    }

    resolveGeoRequest({
      ok: true,
      json: () => Promise.resolve({ country: 'US' }),
    } as Response)

    await refetchPromise

    expect(store.get(geoDataAtom)).toEqual({
      country: 'US',
      isLoading: false,
      isLoaded: true,
      error: null,
    })
  })
})
