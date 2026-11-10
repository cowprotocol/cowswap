import { isValidElement } from 'react'

import Page from './page'

import { getPageBySlug } from '../../../services/cms'

import fallbackContent from '@/data/marketingContentFallback.json'

jest.mock('../../../services/cms', () => ({ getPageBySlug: jest.fn() }))
jest.mock('@/components/AffiliateProgramPageContent', () => ({ AffiliateProgramPageContent: () => null }))

const text = { title: 'CMS affiliate title', description: 'CMS affiliate copy' }
const heading = { heading: 'CMS heading', description: 'CMS description' }
const button = { text: 'CMS button', url: '/careers', newTab: false }
const cmsPage = {
  attributes: {
    metadata: {},
    heading: 'CMS affiliate label',
    contentSections: [
      { __component: 'sections.bottom-actions', ...text, buttons: [button] },
      { __component: 'sections.heading', ...heading },
      { __component: 'sections.features', ...heading, feature: Array.from({ length: 3 }, () => text) },
      { __component: 'sections.heading', ...heading },
      { __component: 'sections.features', ...heading, feature: [text] },
      { __component: 'sections.bottom-actions', ...text, buttons: [button, button] },
    ],
  },
}

describe('Affiliate Program CMS availability', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.mocked(getPageBySlug).mockResolvedValue(cmsPage)
  })

  afterEach(() => jest.restoreAllMocks())

  it('uses valid CMS edits', async () => {
    const page = await Page()
    if (!isValidElement<Record<string, unknown>>(page)) throw new Error('Expected Affiliate page element')
    expect(page.props.content).toMatchObject({
      label: 'CMS affiliate label',
      hero: { ...text, button },
      steps: { title: heading.heading, items: [text, text, text] },
    })
  })

  it.each([
    null,
    { attributes: { heading: 'Affiliate Program', contentSections: [] } },
    { attributes: { heading: 'Affiliate Program', contentSections: 'invalid' } },
    {
      ...cmsPage,
      attributes: {
        ...cmsPage.attributes,
        contentSections: cmsPage.attributes.contentSections.map((section, index) =>
          index === 0 ? { ...section, buttons: [{ ...button, url: 'javascript:alert(1)' }] } : section,
        ),
      },
    },
    {
      ...cmsPage,
      attributes: {
        ...cmsPage.attributes,
        contentSections: [...cmsPage.attributes.contentSections].reverse(),
      },
    },
  ])('keeps the page available when the CMS entry is missing or malformed: %j', async (pageData) => {
    jest.mocked(getPageBySlug).mockResolvedValue(pageData as Awaited<ReturnType<typeof getPageBySlug>>)
    const page = await Page()
    if (!isValidElement<Record<string, unknown>>(page)) throw new Error('Expected Affiliate page element')
    expect(page.props.content).toEqual(fallbackContent.affiliateProgram)
  })

  it('recovers to current CMS content after an outage', async () => {
    jest.mocked(getPageBySlug).mockRejectedValueOnce(new Error('CMS unavailable'))
    const fallbackPage = await Page()
    if (!isValidElement<Record<string, unknown>>(fallbackPage)) throw new Error('Expected Affiliate page element')
    expect(fallbackPage.props.content).toEqual(fallbackContent.affiliateProgram)

    const recoveredPage = await Page()
    if (!isValidElement<Record<string, unknown>>(recoveredPage)) throw new Error('Expected Affiliate page element')
    expect(recoveredPage.props.content).toMatchObject({ label: 'CMS affiliate label' })
  })
})
