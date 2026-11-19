import { act, renderHook, RenderHookResult } from '@testing-library/react'

import { createAiPack } from './aiPack.utils'
import { createLogoPack, downloadPack } from './export.utils'
import { LogoPack } from './solverLogoTool.types'
import { useLogoPackExport } from './useLogoPackExport'

import { deferredPromise, makeLogoAsset } from '../../test/solverLogoTool/fixtures'

jest.mock('@cowprotocol/common-utils', () => jest.requireActual('../../../../../libs/common-utils/src/errors'))
jest.mock('./aiPack.utils', () => ({ createAiPack: jest.fn() }))
jest.mock('./artwork.utils', () => ({ drawArtwork: jest.fn() }))
jest.mock('./canvas.utils', () => ({ createCanvas: () => globalThis.document.createElement('canvas') }))
jest.mock('./export.utils', () => ({ createLogoPack: jest.fn(), downloadPack: jest.fn() }))

const transform = { scale: 70, x: 10, y: -5, background: 'transparent' }
const pack: LogoPack = { blob: new Blob(['pack']), filename: 'solver-logo-pack.zip' }
type ExportSource = Parameters<typeof useLogoPackExport>[0]

function renderExporter(setError = jest.fn()): RenderHookResult<ReturnType<typeof useLogoPackExport>, ExportSource> {
  return renderHook<ReturnType<typeof useLogoPackExport>, ExportSource>(
    (source) => useLogoPackExport(source, transform),
    {
      initialProps: { asset: makeLogoAsset(), solverName: 'Solver', loading: false, setError },
    },
  )
}

describe('logo pack export lifecycle', () => {
  beforeEach(() => jest.resetAllMocks())

  it('downloads the current source and reports completion', async () => {
    jest.mocked(createLogoPack).mockResolvedValue(pack)
    const { result } = renderExporter()
    await act(async () => result.current.exportPack('logo'))
    expect(downloadPack).toHaveBeenCalledWith(pack)
    expect(result.current.status).toBe('Downloaded solver-logo-pack.zip')
    expect(result.current.exporting).toBeNull()
  })

  it('discards a previous source result and allows the next export', async () => {
    const pending = deferredPromise<LogoPack>()
    jest.mocked(createAiPack).mockReturnValueOnce(pending.promise).mockResolvedValueOnce(pack)
    const setError = jest.fn()
    const view = renderExporter(setError)
    let exporting = Promise.resolve()
    act(() => {
      exporting = view.result.current.exportPack('ai')
    })
    expect(view.result.current.exporting).toBe('ai')
    setError.mockClear()
    const nextSource = { asset: makeLogoAsset(), solverName: 'New solver', loading: false, setError }
    view.rerender(nextSource)
    await act(async () => {
      pending.resolve(pack)
      await exporting
    })
    expect(downloadPack).not.toHaveBeenCalled()
    expect(nextSource.setError).not.toHaveBeenCalled()
    expect(view.result.current.status).toBe('')
    expect(view.result.current.exporting).toBeNull()
    await act(async () => view.result.current.exportPack('ai'))
    expect(downloadPack).toHaveBeenCalledTimes(1)
    expect(createAiPack).toHaveBeenLastCalledWith(
      expect.objectContaining({ asset: nextSource.asset, name: 'New solver' }),
    )
  })

  it('does not report a previous source failure on the new source', async () => {
    const pending = deferredPromise<LogoPack>()
    jest.mocked(createLogoPack).mockReturnValueOnce(pending.promise)
    const setError = jest.fn()
    const view = renderExporter(setError)
    let exporting = Promise.resolve()
    act(() => {
      exporting = view.result.current.exportPack('logo')
    })
    setError.mockClear()
    const nextSource = { asset: makeLogoAsset(), solverName: 'New solver', loading: false, setError }
    view.rerender(nextSource)
    await act(async () => {
      pending.reject(new Error('Old export failed'))
      await exporting
    })
    expect(nextSource.setError).not.toHaveBeenCalled()
    expect(downloadPack).not.toHaveBeenCalled()
    expect(view.result.current.exporting).toBeNull()
  })

  it.each(['resolve', 'reject'] as const)(
    'does not download or report an error after unmount (%s)',
    async (outcome) => {
      const pending = deferredPromise<LogoPack>()
      jest.mocked(createAiPack).mockReturnValueOnce(pending.promise)
      const source = { asset: makeLogoAsset(), solverName: 'Solver', loading: false, setError: jest.fn() }
      const view = renderHook(() => useLogoPackExport(source, transform))
      let exporting = Promise.resolve()
      act(() => {
        exporting = view.result.current.exportPack('ai')
      })
      source.setError.mockClear()
      view.unmount()
      await act(async () => {
        if (outcome === 'resolve') pending.resolve(pack)
        else pending.reject(new Error('Unmounted export failed'))
        await exporting
      })
      expect(downloadPack).not.toHaveBeenCalled()
      expect(source.setError).not.toHaveBeenCalled()
    },
  )

  it('releases the export controls after a timeout so either pack can be retried', async () => {
    jest.mocked(createAiPack).mockRejectedValueOnce(new Error('A visual example took too long to load.'))
    jest.mocked(createLogoPack).mockResolvedValueOnce(pack)
    const source = { asset: makeLogoAsset(), solverName: 'Solver', loading: false, setError: jest.fn() }
    const { result } = renderHook(() => useLogoPackExport(source, transform))
    await act(async () => result.current.exportPack('ai'))
    expect(source.setError).toHaveBeenLastCalledWith(expect.stringContaining('too long'))
    expect(result.current.exporting).toBeNull()
    await act(async () => result.current.exportPack('logo'))
    expect(downloadPack).toHaveBeenCalledWith(pack)
    expect(result.current.exporting).toBeNull()
  })
})
