import { readSvg } from './svg.utils'

describe('self-contained SVG validation', () => {
  it.each(['url(#brand)', 'url("#brand")', "url('#brand')", 'url( #brand )'])(
    'accepts local paint references: %s',
    (fill) => {
      const svg = readSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><defs><linearGradient id="brand"/></defs><path style="fill:' +
          fill.replace(/"/g, '&quot;') +
          '" d="M0 0h50v50z"/></svg>',
      )
      expect(svg.width).toBe(100)
      expect(svg.height).toBe(80)
      expect(svg.text).toContain('linearGradient')
    },
  )
  it.each([
    '<script>alert(1)</script>',
    '<path onload="alert(1)"/>',
    '<image href="https://example.com/logo.png"/>',
    '<style>@import "https://example.com/style.css";</style>',
    '<path fill="url(https://example.com/paint)"/>',
    '<animate attributeName="x"/>',
  ])('rejects active or external SVG content: %s', (content) => {
    expect(() =>
      readSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' + content + '</svg>'),
    ).toThrow()
  })
  it('rejects malformed XML and uses explicit dimensions when no viewBox exists', () => {
    expect(() => readSvg('<svg><path></svg>')).toThrow()
    expect(readSvg('<svg xmlns="http://www.w3.org/2000/svg" width="100px" height="80"/>')).toMatchObject({
      width: 100,
      height: 80,
    })
  })
})
