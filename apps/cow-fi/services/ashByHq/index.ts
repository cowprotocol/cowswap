import { CONFIG } from '@/const/meta'

interface AshbyResponse {
  data: {
    jobBoard: {
      teams: { id: string; name: string; parentTeamId: string | null }[]
      jobPostings: {
        id: string
        title: string
        teamId: string
        locationName: string
        employmentType: string
      }[]
    }
  }
}

export async function getJobs() {
  console.log('getJobs function called')
  const jobsData: any = {}
  const { ashbyHqApi } = CONFIG

  console.log('Ashby HQ API URL:', ashbyHqApi)

  try {
    console.log('Fetching data from Ashby HQ API...')
    const response = await fetch(ashbyHqApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apollographql-client-name': 'frontend_non_user',
        'apollographql-client-version': '0.1.0',
      },
      body: JSON.stringify({
        operationName: 'ApiJobBoardWithTeams',
        variables: { organizationHostedJobsPageName: 'cow-dao' },
        query: `
          query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
            jobBoard: jobBoardWithTeams(
              organizationHostedJobsPageName: $organizationHostedJobsPageName
            ) {
              teams {
                id
                name
                parentTeamId
              }
              jobPostings {
                id
                title
                teamId
                locationName
                employmentType
              }
            }
          }
        `,
      }),
    })
    console.log('Response status:', response.status)
    const data = (await response.json()) as AshbyResponse
    console.log('Ashby HQ API response:', JSON.stringify(data, null, 2))

    if (data.data?.jobBoard?.jobPostings) {
      data.data.jobBoard.jobPostings.forEach((job) => {
        const team = data.data.jobBoard.teams.find((t) => t.id === job.teamId)
        const deptName = team ? team.name : 'Other'
        jobsData[deptName] ? jobsData[deptName].push(job) : (jobsData[deptName] = [job])
      })
    } else {
      console.error('Unexpected API response structure:', JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.error('Error fetching jobs:', error)
  }

  console.log('Processed job data:', JSON.stringify(jobsData, null, 2))
  return jobsData
}
