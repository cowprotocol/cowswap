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
})
