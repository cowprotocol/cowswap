import { isValidElement } from 'react'

import Page, { generateMetadata } from './page'

import { getPageBySlug } from '../../../../services/cms'

jest.mock('../../../../services/cms', () => ({ getPageBySlug: jest.fn() }))
jest.mock('react-markdown', () => () => null)
jest.mock('@/components/ReferToEarnPageContent', () => ({ ReferToEarnPageContent: () => null }))
jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('Not found')
  },
}))

const cmsPage = {
  attributes: {
    heading: 'Refer-to-Earn',
    description: 'CMS referral description',
    contentSections: [{ __component: 'sections.rich-text', content: 'CMS referral instructions' }],
  },
}

describe('Refer-to-Earn CMS page', () => {
  beforeEach(() => jest.mocked(getPageBySlug).mockResolvedValue(cmsPage))

  it('passes CMS content to the page that preserves the Careers layout', async () => {
    const page = await Page()
    if (!isValidElement<Record<string, unknown>>(page)) throw new Error('Expected referral page element')
    expect(page.props).toEqual({ title: 'Refer-to-Earn', content: 'CMS referral instructions' })
    expect(getPageBySlug).toHaveBeenCalledWith('refer-to-earn')
  })

  it('preserves the branded browser title and uses the CMS description', async () => {
    expect(await generateMetadata()).toMatchObject({
      title: 'Refer-to-Earn - CoW DAO',
      description: 'CMS referral description',
    })
  })

  it('returns not found when the CMS entry is unavailable', async () => {
    jest.mocked(getPageBySlug).mockResolvedValue(null)
    await expect(Page()).rejects.toThrow('Not found')
  })

  it.each([
    { name: 'no sections', contentSections: [] },
    { name: 'an unrelated section', contentSections: [{ __component: 'sections.heading', heading: 'Instructions' }] },
    { name: 'missing rich text', contentSections: [{ __component: 'sections.rich-text' }] },
    { name: 'empty rich text', contentSections: [{ __component: 'sections.rich-text', content: '' }] },
    { name: 'whitespace-only rich text', contentSections: [{ __component: 'sections.rich-text', content: ' \n\t ' }] },
  ])('returns not found for $name', async ({ contentSections }) => {
    jest.mocked(getPageBySlug).mockResolvedValue({
      attributes: { ...cmsPage.attributes, contentSections },
    })

    await expect(Page()).rejects.toThrow('Not found')
  })
})
