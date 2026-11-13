import { act, renderHook, waitFor } from '@testing-library/react'

import { loadArtwork } from './artwork.utils'
import { LogoAsset } from './solverLogoTool.types'
import { useLogoSource } from './useLogoSource'

jest.mock('./artwork.utils', () => ({ loadArtwork: jest.fn() }))
jest.mock('@cowprotocol/common-utils', () => ({
  normalizeError: (error: unknown): Error => (error instanceof Error ? error : new Error(String(error))),
}))

function makeAsset(name: string): LogoAsset {
  return {
    name,
    type: 'svg',
    width: 1000,
    height: 1000,
    bytes: new Uint8Array(),
    svg: '',
    image: new Image(),
    url: name,
    inkPoints: [],
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    dispose: jest.fn(),
  }
}

describe('logo source lifecycle', () => {
  beforeEach(() => {
    jest.mocked(loadArtwork).mockReset()
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, blob: async (): Promise<Blob> => new Blob(['source']) } as Response)
  })
  afterEach(() => jest.restoreAllMocks())

  it('retains the latest upload when the initial example finishes late, and disposes URLs', async () => {
    let finishInitial: (asset: LogoAsset) => void = (): void => {
      throw new Error('Initial load has not started')
    }
    const initial = new Promise<LogoAsset>((resolve) => {
      finishInitial = resolve
    })
    const stale = makeAsset('example.svg'),
      uploaded = makeAsset('upload.svg')
    jest.mocked(loadArtwork).mockReturnValueOnce(initial).mockResolvedValueOnce(uploaded)
    const view = renderHook(() => useLogoSource())
    await waitFor(() => expect(loadArtwork).toHaveBeenCalledTimes(1))
    await act(async () => view.result.current.loadFile(new File(['upload'], 'upload.svg')))
    await act(async () => finishInitial(stale))
    expect(view.result.current.asset).toBe(uploaded)
    expect(view.result.current.sampleKey).toBeNull()
    expect(stale.dispose).toHaveBeenCalledTimes(1)
    view.unmount()
    expect(uploaded.dispose).toHaveBeenCalledTimes(1)
  })

  it('allows another upload after an image fails to load', async () => {
    const uploaded = makeAsset('good.svg')
    jest.mocked(loadArtwork).mockRejectedValueOnce(new Error('Invalid SVG')).mockResolvedValueOnce(uploaded)
    const view = renderHook(() => useLogoSource())
    await waitFor(() => expect(view.result.current.error).toBe('Invalid SVG'))
    expect(view.result.current.loading).toBe(false)
    await act(async () => view.result.current.loadFile(new File(['good'], 'good.svg')))
    expect(view.result.current.error).toBe('')
    expect(view.result.current.asset).toBe(uploaded)
  })
})
