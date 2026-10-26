import type { ReactNode } from 'react'

import { getJobs } from '../../../services/ashByHq'
import { getPageBySlug } from '../../../services/cms'

import { CareersPageContent } from '@/components/CareersPageContent'
import { parseCareersContent } from '@/util/marketingContent'

export default async function Page(): Promise<ReactNode> {
  const [jobs, page] = await Promise.all([getJobs(), getPageBySlug('careers')])
  const jobsData = jobs || {}
  const content = parseCareersContent(page)
  const department = 'All'

  const jobsCount = Object.keys(jobsData).reduce((acc, cur) => acc + jobsData[cur].length, 0)
  const jobsCountForDepartment = department === 'All' ? jobsCount : jobsData[department].length

  return (
    <CareersPageContent
      content={content}
      department={department}
      jobsCountForDepartment={jobsCountForDepartment}
      jobsCount={jobsCount}
      jobsData={jobsData}
    />
  )
}

export const revalidate = 43200
