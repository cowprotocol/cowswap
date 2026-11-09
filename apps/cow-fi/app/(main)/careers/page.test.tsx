import { isValidElement } from 'react'

import Page from './page'

import { getJobs } from '../../../services/ashByHq'
import { getPageBySlug } from '../../../services/cms'

import type { CareersContent } from '@/util/marketingContent'

import fallbackContent from '@/data/marketingContentFallback.json'

jest.mock('../../../services/ashByHq', () => ({ getJobs: jest.fn() }))
jest.mock('../../../services/cms', () => ({ getPageBySlug: jest.fn() }))
jest.mock('@/components/CareersPageContent', () => ({ CareersPageContent: () => null }))

const text = { title: 'CMS title', description: 'CMS copy' }
const content: CareersContent = {
  intro: text,
  referral: { ...text, button: { text: 'Referral details', url: '/careers/refer-to-earn', newTab: false } },
  notice: { ...text, never: text, actions: text, channels: text, closing: text },
}
const cmsPage = {
  attributes: {
    metadata: {},
    heading: text.title,
    description: text.description,
    contentSections: [
      { __component: 'sections.bottom-actions', ...text, buttons: [content.referral.button] },
      { __component: 'sections.heading', heading: text.title, description: text.description },
      { __component: 'sections.features', feature: Array.from({ length: 4 }, () => text) },
    ],
  },
}

describe('Careers page data sources', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.mocked(getPageBySlug).mockResolvedValue(cmsPage)
    jest.mocked(getJobs).mockResolvedValue({})
  })

  afterEach(() => jest.restoreAllMocks())

  it('retains Ashby departments and listings alongside CMS editorial content', async () => {
    const jobs = {
      Engineering: [{ id: 'ashby-job-id', title: 'Engineer', locationName: 'Remote' }],
      Design: [{ id: 'another-ashby-id', title: 'Designer', locationName: 'Remote' }],
    }
    jest.mocked(getJobs).mockResolvedValue(jobs)
    const page = await Page()
    if (!isValidElement<Record<string, unknown>>(page)) throw new Error('Expected Careers page element')
    expect(page.props).toMatchObject({
      content,
      jobsData: jobs,
      jobsCount: 2,
      jobsCountForDepartment: 2,
      department: 'All',
    })
    expect(getPageBySlug).toHaveBeenCalledWith('careers')
  })

  it('keeps the empty-jobs state separate from available CMS copy', async () => {
    jest.mocked(getJobs).mockResolvedValue({})
    const page = await Page()
    if (!isValidElement<Record<string, unknown>>(page)) throw new Error('Expected Careers page element')
    expect(page.props).toMatchObject({ content, jobsData: {}, jobsCount: 0, jobsCountForDepartment: 0 })
  })

  it.each([
    null,
    { attributes: { heading: 'Careers', contentSections: [] } },
    { attributes: { heading: 'Careers', contentSections: 'invalid' } },
    {
      ...cmsPage,
      attributes: {
        ...cmsPage.attributes,
        contentSections: cmsPage.attributes.contentSections.slice(1),
      },
    },
  ])('keeps Careers available when the CMS entry is missing or malformed: %j', async (pageData) => {
    jest.mocked(getPageBySlug).mockResolvedValue(pageData as Awaited<ReturnType<typeof getPageBySlug>>)
    const page = await Page()
    if (!isValidElement<Record<string, unknown>>(page)) throw new Error('Expected Careers page element')
    expect(page.props.content).toEqual(fallbackContent.careers)
  })

  it('retains Ashby listings when the CMS request rejects', async () => {
    const jobs = { Engineering: [{ id: 'job-id', title: 'Engineer', locationName: 'Remote' }] }
    jest.mocked(getJobs).mockResolvedValue(jobs)
    jest.mocked(getPageBySlug).mockRejectedValue(new Error('CMS unavailable'))

    const page = await Page()
    if (!isValidElement<Record<string, unknown>>(page)) throw new Error('Expected Careers page element')
    expect(page.props).toMatchObject({ content: fallbackContent.careers, jobsData: jobs, jobsCount: 1 })
  })
})
