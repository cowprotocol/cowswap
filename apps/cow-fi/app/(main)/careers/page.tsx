import type { ReactNode } from 'react'

import { getJobs } from '../../../services/ashByHq'

import { CareersPageContent } from '@/components/CareersPageContent'
import { getCareersContent } from '@/util/getMarketingContent'

export default async function Page(): Promise<ReactNode> {
  const [jobs, content] = await Promise.all([getJobs(), getCareersContent()])
  const jobsData = jobs || {}
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
