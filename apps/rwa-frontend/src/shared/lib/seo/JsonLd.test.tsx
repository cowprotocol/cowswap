import { renderToStaticMarkup } from 'react-dom/server'

import { JsonLd } from './JsonLd'

describe('JsonLd', () => {
  it('escapes a string that would close the script element', () => {
    const html = renderToStaticMarkup(<JsonLd data={{ description: '</script><script>alert(1)</script>' }} />)

    expect(html).not.toContain('</script><script>')
    expect(JSON.parse(html.replace(/^<script[^>]*>|<\/script>$/g, ''))).toEqual({
      description: '</script><script>alert(1)</script>',
    })
  })
})
