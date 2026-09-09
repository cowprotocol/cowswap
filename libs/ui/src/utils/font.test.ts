import { font } from './font'

import { Font } from '../consts'
import { UI } from '../enum'

describe('font', () => {
  it('emits size and line-height without a weight', () => {
    expect(font('FONT_MEDIUM')).toBe('font-size: 16px; line-height: 22px;')
  })

  it('emits a CSS variable for a named weight', () => {
    expect(font('FONT_MEDIUM', 'semibold')).toBe(
      `font-size: 16px; line-height: 22px; font-weight: var(${UI.FONT_WEIGHT_SEMIBOLD});`,
    )
  })

  it('maps Font.weight numbers to the matching CSS variable', () => {
    expect(font('FONT_LARGE', Font.weight.bold)).toBe(
      `font-size: 18px; line-height: 24px; font-weight: var(${UI.FONT_WEIGHT_BOLD});`,
    )
  })

  it('maps regular to the normal weight CSS variable', () => {
    expect(font('FONT_NORMAL', 'regular')).toContain(`font-weight: var(${UI.FONT_WEIGHT_NORMAL});`)
  })

  it('throws for an unknown sizing token', () => {
    expect(() => font('FONT_DOES_NOT_EXIST' as 'FONT_MEDIUM')).toThrow('Invalid font key: FONT_DOES_NOT_EXIST')
  })
})
