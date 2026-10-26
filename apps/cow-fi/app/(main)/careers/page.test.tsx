import { isValidElement } from 'react'

import Page from './page'

import { getJobs } from '../../../services/ashByHq'
import { getPageBySlug } from '../../../services/cms'

import type { CareersContent } from '@/util/marketingContent'

import { parseCareersContent } from '@/util/marketingContent'

jest.mock('../../../services/ashByHq', () => ({ getJobs: jest.fn() }))
jest.mock('../../../services/cms', () => ({ getPageBySlug: jest.fn() }))
jest.mock('@/util/marketingContent', () => ({ parseCareersContent: jest.fn() }))
jest.mock('@/components/CareersPageContent', () => ({ CareersPageContent: () => null }))

const text = { title: 'CMS title', description: 'CMS copy' }
const content: CareersContent = {
  intro: text,
  referral: { ...text, button: { text: 'Referral details', url: '/careers/refer-to-earn', newTab: false } },
  notice: { ...text, never: text, actions: text, channels: text, closing: text },
}
const cmsPage = { id: 11 }

describe('Careers page data sources', () => {
  beforeEach(() => {
    jest.mocked(getPageBySlug).mockResolvedValue(cmsPage)
    jest.mocked(parseCareersContent).mockReturnValue(content)
  })

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
    expect(parseCareersContent).toHaveBeenCalledWith(cmsPage)
  })

  it('keeps the empty-jobs state separate from available CMS copy', async () => {
    jest.mocked(getJobs).mockResolvedValue({})
    const page = await Page()
    if (!isValidElement<Record<string, unknown>>(page)) throw new Error('Expected Careers page element')
    expect(page.props).toMatchObject({ content, jobsData: {}, jobsCount: 0, jobsCountForDepartment: 0 })
  })
})
