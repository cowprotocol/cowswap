import { parseAffiliateContent, parseCareersContent } from './marketingContent'

import type { MarketingButton, MarketingText } from './marketingContent'

interface FixturePage {
  attributes: {
    heading: string
    description?: string
    contentSections: {
      __component: string
      heading?: string
      title?: string
      description?: string
      buttons?: MarketingButton[]
      feature?: MarketingText[]
    }[]
  }
}

const text = { title: 'Section title', description: 'Section **copy**' }
const heading = { heading: 'Section heading', description: 'Section description' }
const button = { text: 'Open page', url: '/careers/refer-to-earn', newTab: false }

function affiliatePage(): FixturePage {
  return {
    attributes: {
      heading: 'Affiliate Program',
      contentSections: [
        { __component: 'sections.bottom-actions', ...text, buttons: [{ ...button }] },
        { __component: 'sections.heading', ...heading },
        { __component: 'sections.features', ...heading, feature: Array.from({ length: 3 }, () => ({ ...text })) },
        { __component: 'sections.heading', ...heading },
        { __component: 'sections.features', ...heading, feature: [{ ...text }] },
        { __component: 'sections.bottom-actions', ...text, buttons: [{ ...button }, { ...button }] },
      ],
    },
  }
}

function careersPage(): FixturePage {
  return {
    attributes: {
      ...heading,
      contentSections: [
        { __component: 'sections.bottom-actions', ...text, buttons: [{ ...button }] },
        { __component: 'sections.heading', ...heading },
        { __component: 'sections.features', feature: Array.from({ length: 4 }, () => ({ ...text })) },
      ],
    },
  }
}

describe('marketing CMS content', () => {
  it('uses editable Careers copy, Markdown and CTA fields without relying on CMS IDs', () => {
    const page = careersPage()
    page.attributes.contentSections[0].title = 'Updated referral offer'
    const content = parseCareersContent(page)
    expect(content.intro.title).toBe(heading.heading)
    expect(content.referral.title).toBe('Updated referral offer')
    expect(content.referral.button).toEqual(button)
    expect(content.notice.never.description).toBe('Section **copy**')
  })

  it('allows editors to add FAQ entries while retaining the three illustrated process steps', () => {
    const page = affiliatePage()
    page.attributes.contentSections[4].feature?.push({ title: 'New question', description: 'New answer' })
    const content = parseAffiliateContent(page)
    expect(content.faq.items).toContainEqual({ title: 'New question', description: 'New answer' })
    expect(content.steps.items).toHaveLength(3)
    expect(content.footer.docsButton.text).toBe(button.text)
  })

  it('rejects missing nested population and incomplete page templates', () => {
    expect(() => parseCareersContent(null)).toThrow('Missing marketing page content')
    const page = careersPage()
    delete page.attributes.contentSections[0].buttons
    expect(() => parseCareersContent(page)).toThrow('Invalid CMS marketing button count')
    expect(() => parseAffiliateContent(careersPage())).toThrow('Unexpected marketing page section count')
  })

  it('rejects misplaced sections and missing safety copy', () => {
    const page = careersPage()
    page.attributes.contentSections.reverse()
    expect(() => parseCareersContent(page)).toThrow('Unexpected CMS marketing section')
    const incomplete = careersPage()
    incomplete.attributes.contentSections[2].feature?.pop()
    expect(() => parseCareersContent(incomplete)).toThrow('Invalid CMS marketing feature count')
  })

  it('rejects an illustration mismatch or blank FAQ answer', () => {
    const page = affiliatePage()
    page.attributes.contentSections[2].feature?.pop()
    expect(() => parseAffiliateContent(page)).toThrow('Invalid CMS marketing feature count')
    const blank = affiliatePage()
    const question = blank.attributes.contentSections[4].feature?.[0]
    if (question) question.description = '  '
    expect(() => parseAffiliateContent(blank)).toThrow('Missing marketing text')
  })

  it.each([
    'javascript:alert(1)',
    '//example.com',
    '/\\example.com',
    'http://example.com',
    'https://',
    'https://a:b@example.com',
  ])('rejects an unsafe or malformed button URL: %s', (url) => {
    const page = careersPage()
    const cta = page.attributes.contentSections[0].buttons?.[0]
    if (cta) cta.url = url
    expect(() => parseCareersContent(page)).toThrow('require a local path or HTTPS URL')
  })

  it('retains HTTPS URLs, fragments and the configured tab behavior', () => {
    const page = careersPage()
    const cta = page.attributes.contentSections[0].buttons?.[0]
    if (cta) {
      cta.url = 'https://swap.cow.fi/#/account/affiliate'
      cta.newTab = true
    }
    expect(parseCareersContent(page).referral.button).toEqual({
      text: button.text,
      url: 'https://swap.cow.fi/#/account/affiliate',
      newTab: true,
    })
  })
})
