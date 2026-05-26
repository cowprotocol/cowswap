import {
  getAllowedHtmlImage,
  getAllowedHtmlImages,
  remarkAllowedHtmlImages,
  sanitizeCmsMarkdown,
} from './markdownHtmlImages'

interface TestMarkdownNode {
  type: string
  value?: string
  children?: TestMarkdownNode[]
  url?: string
  alt?: string
  title?: string | null
}

describe('markdownHtmlImages', () => {
  it('keeps CMS HTML paragraph text renderable after raw HTML is skipped', () => {
    expect(
      sanitizeCmsMarkdown(
        '<p>Linked orders are advanced trading instructions where two or more orders are tied together by conditions.</p><p>CoW Swap protects against downside risk.</p>',
      ),
    ).toBe(
      'Linked orders are advanced trading instructions where two or more orders are tied together by conditions.\n\nCoW Swap protects against downside risk.',
    )
  })

  it('drops unsafe HTML blocks while preserving safe text', () => {
    expect(sanitizeCmsMarkdown('<p>Safe text</p><script>alert(1)</script><svg><circle /></svg>')).toBe('Safe text')
  })

  it('turns safe image tags into markdown images', () => {
    expect(sanitizeCmsMarkdown('<p><img src="/uploads/cow.png" alt="CoW &amp; Swap"></p>')).toBe(
      '![CoW & Swap](/uploads/cow.png)',
    )
  })

  it('extracts safe CMS image attributes from a raw HTML image tag', () => {
    expect(getAllowedHtmlImage('<img src="https://cms.cow.fi/uploads/cow.png" alt="CoW &amp; Swap">')).toEqual({
      src: 'https://cms.cow.fi/uploads/cow.png',
      alt: 'CoW & Swap',
    })
  })

  it('extracts safe CMS images wrapped in common rich-text HTML containers', () => {
    expect(getAllowedHtmlImage('<figure class="image"><img src="/uploads/cow.png" alt="CoW"></figure>')).toEqual({
      src: '/uploads/cow.png',
      alt: 'CoW',
    })
    expect(getAllowedHtmlImage("<p><img src='/uploads/cow-2.png' alt='CoW 2' /></p>")).toEqual({
      src: '/uploads/cow-2.png',
      alt: 'CoW 2',
    })
  })

  it('extracts multiple safe CMS images from one HTML block', () => {
    expect(
      getAllowedHtmlImages(
        '<figure><img src="/uploads/cow.png" alt="CoW"></figure><p><img src="/uploads/moo.png" alt="Moo"></p>',
      ),
    ).toEqual([
      { src: '/uploads/cow.png', alt: 'CoW' },
      { src: '/uploads/moo.png', alt: 'Moo' },
    ])
  })

  it('rejects non-image and unsafe image HTML', () => {
    expect(getAllowedHtmlImage('<script>alert(1)</script>')).toBeNull()
    expect(getAllowedHtmlImage('<img src="javascript:alert(1)" alt="Bad">')).toBeNull()
    expect(getAllowedHtmlImage('<img src="java&#x0a;script:alert(1)" alt="Bad">')).toBeNull()
    expect(getAllowedHtmlImage('<svg><img src="/uploads/cow.png" alt="CoW"></svg>')).toBeNull()
    expect(getAllowedHtmlImage('<script><img src="/uploads/cow.png" alt="CoW"></script>')).toBeNull()
  })

  it('converts only allowed HTML image nodes into markdown image nodes', () => {
    const tree: TestMarkdownNode = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'html',
              value: '<img src="/uploads/cow.png" alt="CoW">',
            },
            {
              type: 'html',
              value: '<figure><img src="/uploads/moo.png" alt="Moo"></figure>',
            },
            {
              type: 'html',
              value: '<iframe><img src="/uploads/ignored.png" alt="Ignored"></iframe>',
            },
          ],
        },
      ],
    }

    remarkAllowedHtmlImages()(tree)

    expect(tree.children?.[0]?.children?.[0]).toEqual({
      type: 'image',
      url: '/uploads/cow.png',
      alt: 'CoW',
      title: null,
    })
    expect(tree.children?.[0]?.children?.[1]).toEqual({
      type: 'image',
      url: '/uploads/moo.png',
      alt: 'Moo',
      title: null,
    })
    expect(tree.children?.[0]?.children?.[2]).toEqual({
      type: 'html',
      value: '<iframe><img src="/uploads/ignored.png" alt="Ignored"></iframe>',
    })
  })
})
