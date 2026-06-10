import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { mapWidgetTheme } from './mapWidgetTheme'

import type { DefaultTheme } from 'styled-components/macro'

describe('mapWidgetTheme', () => {
  it('merges palette colors and maps paper to button text', () => {
    const defaultTheme = {
      boxShadow1: '0 12px 12px rgba(5, 43, 101, 0.06)',
      paper: '#ffffff',
    } as DefaultTheme

    const widgetTheme: Partial<CowSwapWidgetPalette> = {
      baseTheme: 'dark',
      paper: '#101010',
      primary: '#ffffff',
    }

    const result = mapWidgetTheme(widgetTheme, defaultTheme)

    expect(result.paper).toBe('#101010')
    expect(result.buttonTextCustom).toBe('#101010')
    expect(result.primary).toBe('#ffffff')
    expect(result.boxShadow1).toBe('0 12px 12px rgba(5, 43, 101, 0.06)')
  })
})
