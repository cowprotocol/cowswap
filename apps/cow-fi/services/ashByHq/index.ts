'use server'

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'

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
  const jobsData: any = {}
  const { ashbyHqApi } = CONFIG

  try {
    const response = await fetch(ashbyHqApi, {
      next: { revalidate: DATA_CACHE_TIME_SECONDS },
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

    const data = (await response.json()) as AshbyResponse

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

  return jobsData
}
