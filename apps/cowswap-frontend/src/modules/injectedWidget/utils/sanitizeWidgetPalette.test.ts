import { sanitizeWidgetPalette } from './sanitizeWidgetPalette'

describe('sanitizeWidgetPalette', () => {
  it('keeps valid palette colors, baseTheme and boxShadow', () => {
    const palette = {
      baseTheme: 'dark',
      primary: '#052b65',
      background: 'rgba(1, 2, 3, 0.5)',
      paper: 'hsl(10, 20%, 30%)',
      text: 'white',
      danger: 'transparent',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12), inset 0 0 0 1px #fff',
    }

    expect(sanitizeWidgetPalette(palette)).toEqual(palette)
  })

  it('returns an empty palette for non-object input', () => {
    expect(sanitizeWidgetPalette('red')).toEqual({})
    expect(sanitizeWidgetPalette(null)).toEqual({})
    expect(sanitizeWidgetPalette(['#fff'])).toEqual({})
  })

  it('drops unknown keys', () => {
    expect(sanitizeWidgetPalette({ primary: '#fff', 'x}body{color': 'red', fontFamily: 'Arial' })).toEqual({
      primary: '#fff',
    })
  })

  it('drops colors that break out of the CSS declaration', () => {
    expect(
      sanitizeWidgetPalette({
        primary: 'red;} body { background: url(https://evil.example/x.png) } a{',
        paper: '#fff;}',
        text: 'url(https://evil.example/x.png)',
        info: 'var(--x)',
        success: 42,
        warning: '#00ff00',
      }),
    ).toEqual({ warning: '#00ff00' })
  })

  it('drops an unsupported baseTheme', () => {
    expect(sanitizeWidgetPalette({ baseTheme: 'dark;}', primary: '#fff' })).toEqual({ primary: '#fff' })
  })

  it('drops unsafe boxShadow values', () => {
    const unsafe = [
      '0 0 1px red; } body { display: none',
      '0 0 1px url(https://evil.example/x.png)',
      'expression(alert(1))',
      '0 0 1px red /* comment */',
      '0 0 1px "red"',
      '0 0 1px red\\3b',
    ]

    unsafe.forEach((boxShadow) => {
      expect(sanitizeWidgetPalette({ boxShadow })).toEqual({})
    })
  })

  it('keeps boxShadow none', () => {
    expect(sanitizeWidgetPalette({ boxShadow: 'none' })).toEqual({ boxShadow: 'none' })
  })
})
