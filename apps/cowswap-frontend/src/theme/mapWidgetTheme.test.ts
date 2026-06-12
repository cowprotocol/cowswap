import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { mapWidgetTheme } from './mapWidgetTheme'

import type { DefaultTheme } from 'styled-components/macro'

describe('mapWidgetTheme', () => {
  it('maps custom widget shadow to the main widget container shadow', () => {
    const defaultTheme = {
      boxShadow1: '0 12px 12px rgba(5, 43, 101, 0.06)',
      paper: '#ffffff',
    } as DefaultTheme

    const widgetTheme: Partial<CowSwapWidgetPalette> = {
      paper: '#101010',
      boxShadow: 'none',
    }

    const result = mapWidgetTheme(widgetTheme, defaultTheme)

    expect(result.paper).toBe('#101010')
    expect(result.buttonTextCustom).toBe('#101010')
    expect(result.boxShadow1).toBe('none')
  })

  it('drops unsafe palette values before they reach the theme', () => {
    const defaultTheme = {
      primary: '#123456',
      paper: '#ffffff',
      boxShadow1: '0 12px 12px rgba(5, 43, 101, 0.06)',
    } as DefaultTheme

    const widgetTheme: Partial<CowSwapWidgetPalette> = {
      primary: '#abcdef; background: red;',
      paper: '#111111',
      boxShadow: '0 0 0 1px red; background: blue;',
    }

    const result = mapWidgetTheme(widgetTheme, defaultTheme)

    expect(result.primary).toBe('#123456')
    expect(result.paper).toBe('#111111')
    expect(result.buttonTextCustom).toBe('#111111')
    expect(result.boxShadow1).toBe('0 12px 12px rgba(5, 43, 101, 0.06)')
  })
})
