import { CONFIG } from '@/const/meta'

export async function getJobs() {
  const jobsData: any = {}
  const { api } = CONFIG.greenhouse

  try {
    const response = await fetch(api)
    const data = await response.json()
    data.jobs.forEach((job: any) => {
      const deptName = job.departments[0].name
      deptName && jobsData[deptName] ? jobsData[deptName].push(job) : (jobsData[deptName] = [job])
    })
  } catch (error) {
    console.log(error)
  }

  return jobsData
}
