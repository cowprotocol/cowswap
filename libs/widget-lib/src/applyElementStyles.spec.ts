import { assignElementStyles } from './applyElementStyles'

import type * as CSS from 'csstype'

describe('assignElementStyles', () => {
  it('does nothing when styles is undefined', () => {
    const el = document.createElement('div')
    el.setAttribute('style', 'color: red;')
    assignElementStyles(el, undefined)
    expect(el.getAttribute('style')).toBe('color: red;')
  })

  it('removes the style attribute when styles is an empty object', () => {
    const el = document.createElement('div')
    el.setAttribute('style', 'color: red;')
    assignElementStyles(el, {})
    expect(el.hasAttribute('style')).toBe(false)
  })

  it('applies camelCase string properties to the element style', () => {
    const el = document.createElement('div')
    assignElementStyles(el, { width: '100px', backgroundColor: 'transparent' })
    expect(el.style.width).toBe('100px')
    expect(el.style.backgroundColor).toBe('transparent')
  })

  it('skips keys whose value is undefined', () => {
    const el = document.createElement('div')
    assignElementStyles(el, { width: '10px', height: undefined })
    expect(el.style.width).toBe('10px')
    expect(el.style.height).toBe('')
  })

  it('sets an empty string when the value is null', () => {
    const el = document.createElement('div')
    assignElementStyles(el, { margin: null } as unknown as CSS.Properties)
    expect(el.style.margin).toBe('')
  })

  it('skips non-string values such as numbers', () => {
    const el = document.createElement('div')
    assignElementStyles(el, {
      width: '20px',
      // csstype allows numeric opacity; runtime number must be ignored by assignElementStyles
      opacity: 0.5,
    })
    expect(el.style.width).toBe('20px')
    expect(el.style.opacity).toBe('')
  })

  it('applies empty string for an explicit empty string value', () => {
    const el = document.createElement('div')
    el.style.padding = '8px'
    assignElementStyles(el, { padding: '' })
    expect(el.style.padding).toBe('')
  })
})
