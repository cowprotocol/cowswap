import { createElement, type ReactNode } from 'react'

import { renderHook, type RenderHookResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { useInjectedWidgetPalette } from './useInjectedWidgetPalette'

function renderPaletteHook(search: string): RenderHookResult<ReturnType<typeof useInjectedWidgetPalette>, unknown> {
  return renderHook(() => useInjectedWidgetPalette(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(MemoryRouter, { initialEntries: [`/widget${search}`] }, children),
  })
}

describe('useInjectedWidgetPalette', () => {
  it('returns undefined when the palette param is absent', () => {
    const { result } = renderPaletteHook('')

    expect(result.current).toBeUndefined()
  })

  it('returns null when palette=null', () => {
    const { result } = renderPaletteHook('?palette=null')

    expect(result.current).toBeNull()
  })

  it('returns parsed palette JSON from the URL', () => {
    const palette = { paper: '#ff0', primary: '#052b65' }
    const { result } = renderPaletteHook(`?palette=${encodeURIComponent(JSON.stringify(palette))}`)

    expect(result.current).toEqual(palette)
  })

  it('returns null when the palette param cannot be parsed', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    const { result } = renderPaletteHook('?palette=not-valid-json')

    expect(result.current).toBeNull()
    expect(consoleError).toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
