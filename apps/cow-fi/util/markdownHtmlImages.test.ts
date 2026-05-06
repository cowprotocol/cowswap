import { getAllowedHtmlImage, remarkAllowedHtmlImages } from './markdownHtmlImages'

interface TestMarkdownNode {
  type: string
  value?: string
  children?: TestMarkdownNode[]
  url?: string
  alt?: string
  title?: string | null
}

describe('markdownHtmlImages', () => {
  it('extracts safe CMS image attributes from a raw HTML image tag', () => {
    expect(getAllowedHtmlImage('<img src="https://cms.cow.fi/uploads/cow.png" alt="CoW &amp; Swap">')).toEqual({
      src: 'https://cms.cow.fi/uploads/cow.png',
      alt: 'CoW & Swap',
    })
  })

  it('rejects non-image and unsafe image HTML', () => {
    expect(getAllowedHtmlImage('<script>alert(1)</script>')).toBeNull()
    expect(getAllowedHtmlImage('<img src="javascript:alert(1)" alt="Bad">')).toBeNull()
    expect(getAllowedHtmlImage('<img src="java&#x0a;script:alert(1)" alt="Bad">')).toBeNull()
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
              value: '<iframe src="https://example.com"></iframe>',
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
      type: 'html',
      value: '<iframe src="https://example.com"></iframe>',
    })
  })
})
