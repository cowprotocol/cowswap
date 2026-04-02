import { useSetAtom } from 'jotai'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { renderHook } from '@testing-library/react'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useInjectedWidgetPalette } from 'modules/injectedWidget'

import { getCowswapTheme } from './getCowswapTheme'
import { mapWidgetTheme } from './mapWidgetTheme'
import { ThemeConfigUpdater } from './ThemeConfigUpdater'

jest.mock('jotai', () => ({
  atom: jest.fn(),
  useSetAtom: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  isInjectedWidget: jest.fn(),
}))

jest.mock('./getCowswapTheme', () => ({
  getCowswapTheme: jest.fn(),
}))

jest.mock('./mapWidgetTheme', () => ({
  mapWidgetTheme: jest.fn(),
}))

jest.mock('./themeConfigAtom', () => ({
  themeConfigAtom: Symbol('themeConfigAtom'),
}))

jest.mock('../legacy/state/user/hooks', () => ({
  useIsDarkMode: jest.fn(),
}))

jest.mock('../modules/injectedWidget', () => ({
  useInjectedWidgetPalette: jest.fn(),
}))

const mockedUseSetAtom = useSetAtom as jest.MockedFunction<typeof useSetAtom>
const mockedIsInjectedWidget = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>
const mockedGetCowswapTheme = getCowswapTheme as jest.MockedFunction<typeof getCowswapTheme>
const mockedMapWidgetTheme = mapWidgetTheme as jest.MockedFunction<typeof mapWidgetTheme>
const mockedUseIsDarkMode = useIsDarkMode as jest.MockedFunction<typeof useIsDarkMode>
const mockedUseInjectedWidgetPalette = useInjectedWidgetPalette as jest.MockedFunction<typeof useInjectedWidgetPalette>

describe('ThemeConfigUpdater', () => {
  const mockSetThemeConfig = jest.fn()
  const lightTheme = { bg1: '#fff', isWidget: false } as never
  const darkTheme = { bg1: '#000', isWidget: false } as never
  const widgetTheme = { primary: '#f00', isWidget: true } as never
  const palette = { paper: '#ff0' }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSetAtom.mockReturnValue(mockSetThemeConfig)
    mockedIsInjectedWidget.mockReturnValue(false)
    mockedUseIsDarkMode.mockReturnValue(false)
    mockedUseInjectedWidgetPalette.mockReturnValue(undefined)
    mockedGetCowswapTheme.mockReturnValue(lightTheme)
    mockedMapWidgetTheme.mockReturnValue(widgetTheme)
  })

  describe('non-widget mode', () => {
    beforeEach(() => {
      mockedIsInjectedWidget.mockReturnValue(false)
    })

    it('sets light theme when dark mode is off', () => {
      mockedUseIsDarkMode.mockReturnValue(false)
      mockedGetCowswapTheme.mockReturnValue(lightTheme)

      renderHook(() => ThemeConfigUpdater())

      expect(mockedGetCowswapTheme).toHaveBeenCalledWith(false)
      expect(mockSetThemeConfig).toHaveBeenCalledWith(lightTheme)
      expect(mockedMapWidgetTheme).not.toHaveBeenCalled()
    })

    it('sets dark theme when dark mode is on', () => {
      mockedUseIsDarkMode.mockReturnValue(true)
      mockedGetCowswapTheme.mockReturnValue(darkTheme)

      renderHook(() => ThemeConfigUpdater())

      expect(mockedGetCowswapTheme).toHaveBeenCalledWith(true)
      expect(mockSetThemeConfig).toHaveBeenCalledWith(darkTheme)
    })

    it('updates theme config when dark mode changes', () => {
      mockedGetCowswapTheme.mockReturnValueOnce(lightTheme).mockReturnValueOnce(darkTheme)

      const { rerender } = renderHook(() => ThemeConfigUpdater())

      expect(mockSetThemeConfig).toHaveBeenLastCalledWith(lightTheme)

      mockedUseIsDarkMode.mockReturnValue(true)
      rerender()

      expect(mockSetThemeConfig).toHaveBeenLastCalledWith(darkTheme)
    })
  })

  describe('widget mode', () => {
    beforeEach(() => {
      mockedIsInjectedWidget.mockReturnValue(true)
    })

    it('calls mapWidgetTheme and sets result when palette is provided', () => {
      mockedUseInjectedWidgetPalette.mockReturnValue(palette)
      mockedMapWidgetTheme.mockReturnValue(widgetTheme)

      renderHook(() => ThemeConfigUpdater())

      expect(mockedMapWidgetTheme).toHaveBeenCalledWith(palette, lightTheme)
      expect(mockSetThemeConfig).toHaveBeenCalledWith(widgetTheme)
    })

    it('calls mapWidgetTheme with undefined palette when no palette in URL', () => {
      mockedUseInjectedWidgetPalette.mockReturnValue(undefined)
      mockedMapWidgetTheme.mockReturnValue(lightTheme)

      renderHook(() => ThemeConfigUpdater())

      expect(mockedMapWidgetTheme).toHaveBeenCalledWith(undefined, lightTheme)
      expect(mockSetThemeConfig).toHaveBeenCalledWith(lightTheme)
    })

    it('preserves last non-undefined widgetTheme when palette disappears from URL', () => {
      mockedUseInjectedWidgetPalette.mockReturnValue(palette)

      const { rerender } = renderHook(() => ThemeConfigUpdater())

      // Palette disappears (e.g. URL changes to null)
      mockedUseInjectedWidgetPalette.mockReturnValue(undefined)
      rerender()

      // widgetTheme state should still hold the last non-undefined palette
      expect(mockedMapWidgetTheme).toHaveBeenLastCalledWith(palette, lightTheme)
    })

    it('updates widgetTheme state when a new palette arrives', () => {
      const newPalette = { paper: '#0f0' }
      const newWidgetTheme = { primary: '#0f0', isWidget: true } as never

      mockedUseInjectedWidgetPalette.mockReturnValue(palette)

      const { rerender } = renderHook(() => ThemeConfigUpdater())

      mockedUseInjectedWidgetPalette.mockReturnValue(newPalette)
      mockedMapWidgetTheme.mockReturnValue(newWidgetTheme)
      rerender()

      expect(mockedMapWidgetTheme).toHaveBeenLastCalledWith(newPalette, lightTheme)
      expect(mockSetThemeConfig).toHaveBeenLastCalledWith(newWidgetTheme)
    })
  })
})
