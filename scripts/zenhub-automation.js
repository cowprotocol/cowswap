const fetch = require('node-fetch')

const restApiToken = process.env.ZENHUB_API_TOKEN

const pipelineStatus = process.env.pipelineStatus
const issuesIds = process.env.issuesIds

const repoId = '475419392'
const workspaceId = '6246bc1e8d5e5b0010c77c74'
const reviewPipelineId = 'Z2lkOi8vcmFwdG9yL1BpcGVsaW5lLzI4MzE0Mzg'
const inProgressPipelineId = 'Z2lkOi8vcmFwdG9yL1BpcGVsaW5lLzI5NDkzNDU'

if (!pipelineStatus) throw new Error('pipelineStatus must be specified')
if (!issuesIds) throw new Error('issuesIds must be specified')

console.log('ENV:', {
  issuesIds,
  pipelineStatus
})

const issueId = issuesIds.split(' ').map(i => i.trim())[0]
const pipelineId = pipelineStatus === 'review' ? reviewPipelineId : inProgressPipelineId
const url = `https://api.zenhub.com/p2/workspaces/${workspaceId}/repositories/${repoId}/issues/${issueId}/moves`

fetch(url, {
  method: 'POST',
  headers: {
    'X-Authentication-Token': restApiToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    pipeline_id: pipelineId,
    position: 'top'
  })
}).then(res => console.log('Zenhub automation HTTP code: ', res.status))
