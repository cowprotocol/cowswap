import { CareersPageContent } from '@/components/CareersPageContent'

import { getJobs } from '../../../services/ashByHq'

export default async function Page() {
  const jobsData = (await getJobs()) || {}
  const department = 'All'

  const jobsCount = Object.keys(jobsData).reduce((acc, cur) => acc + jobsData[cur].length, 0)
  const jobsCountForDepartment = department === 'All' ? jobsCount : jobsData[department].length

  return (
    <CareersPageContent
      department={department}
      jobsCountForDepartment={jobsCountForDepartment}
      jobsCount={jobsCount}
      jobsData={jobsData}
    />
  )
}
