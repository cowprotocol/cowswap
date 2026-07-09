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

  it('skips keys whose value is null', () => {
    const el = document.createElement('div')
    assignElementStyles(el, { width: '10px', margin: null } as unknown as CSS.Properties)
    expect(el.style.width).toBe('10px')
    expect(el.style.margin).toBe('')
  })

  it('stringifies numeric values for the element style', () => {
    const el = document.createElement('div')
    assignElementStyles(el, {
      width: '20px',
      opacity: 0.5,
      inset: 0,
    })
    expect(el.style.width).toBe('20px')
    expect(el.style.opacity).toBe('0.5')
    expect(el.style.inset).toBe('0')
  })

  it('applies full-screen preset layout properties including numeric inset', () => {
    const el = document.createElement('div')
    assignElementStyles(el, {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'red',
    })
    expect(el.style.position).toBe('absolute')
    expect(el.style.inset).toBe('0')
    expect(el.style.width).toBe('100%')
    expect(el.style.height).toBe('100%')
  })

  it('applies empty string for an explicit empty string value', () => {
    const el = document.createElement('div')
    el.style.padding = '8px'
    assignElementStyles(el, { padding: '' })
    expect(el.style.padding).toBe('')
  })
})
