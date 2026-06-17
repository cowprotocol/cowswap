const GITHUB_API_BASE = 'https://api.github.com'

export class GitHubApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
  }
}

export function createGitHubClient({ apiBase = process.env.GITHUB_API_URL ?? GITHUB_API_BASE, repoFullName, token }) {
  const [owner, repo] = repoFullName.split('/')

  if (!owner || !repo) {
    throw new Error(`Expected GITHUB_REPOSITORY to be in owner/repo format, received: ${repoFullName}`)
  }

  async function request(method, path, body) {
    const response = await fetch(`${apiBase}${path}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      method,
    })
    const responseBody = await response.text()
    const data = parseGitHubResponse(responseBody)

    if (!response.ok) {
      const message = getGitHubErrorMessage(data, response.status)
      throw new GitHubApiError(response.status, message)
    }

    return data
  }

  return {
    async addIssueLabels(issueNumber, labels) {
      return request('POST', `/repos/${owner}/${repo}/issues/${issueNumber}/labels`, { labels })
    },
    async createIssueComment(issueNumber, body) {
      return request('POST', `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, { body })
    },
    async createPullRequest(payload) {
      return request('POST', `/repos/${owner}/${repo}/pulls`, payload)
    },
    async createRef(branchName, sha) {
      return request('POST', `/repos/${owner}/${repo}/git/refs`, {
        ref: `refs/heads/${branchName}`,
        sha,
      })
    },
    async closePullRequest(prNumber) {
      return request('PATCH', `/repos/${owner}/${repo}/pulls/${prNumber}`, { state: 'closed' })
    },
    async deleteRef(branchName) {
      return request('DELETE', `/repos/${owner}/${repo}/git/refs/${encodeGitRefPath(`heads/${branchName}`)}`)
    },
    async getCollaboratorPermission(username) {
      const data = await request(
        'GET',
        `/repos/${owner}/${repo}/collaborators/${encodeURIComponent(username)}/permission`,
      )
      return typeof data.permission === 'string' ? data.permission : 'none'
    },
    async getPullRequest(prNumber) {
      return request('GET', `/repos/${owner}/${repo}/pulls/${prNumber}`)
    },
    async getPullRequestByHead(branchName) {
      const pulls = await request(
        'GET',
        `/repos/${owner}/${repo}/pulls?state=open&head=${encodeURIComponent(`${owner}:${branchName}`)}&per_page=1`,
      )

      if (!Array.isArray(pulls)) {
        return null
      }

      return pulls[0] ?? null
    },
    async findIssueComment(issueNumber, predicate) {
      const perPage = 100
      let page = 1

      while (true) {
        const comments = await request(
          'GET',
          `/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=${perPage}&page=${page}`,
        )

        if (!Array.isArray(comments)) {
          return null
        }

        const match = comments.find(predicate)

        if (match) {
          return match
        }

        if (comments.length < perPage) {
          return null
        }

        page += 1
      }
    },
    async removeIssueLabel(issueNumber, labelName) {
      try {
        return await request(
          'DELETE',
          `/repos/${owner}/${repo}/issues/${issueNumber}/labels/${encodeURIComponent(labelName)}`,
        )
      } catch (error) {
        if (isNotFoundError(error)) {
          return null
        }
        throw error
      }
    },
    async updateIssueComment(commentId, body) {
      return request('PATCH', `/repos/${owner}/${repo}/issues/comments/${commentId}`, { body })
    },
    async updatePullRequest(prNumber, payload) {
      return request('PATCH', `/repos/${owner}/${repo}/pulls/${prNumber}`, payload)
    },
    async updateRef(branchName, sha) {
      return request('PATCH', `/repos/${owner}/${repo}/git/refs/${encodeGitRefPath(`heads/${branchName}`)}`, {
        force: true,
        sha,
      })
    },
  }
}

export function isNotFoundError(error) {
  return error?.status === 404
}

function encodeGitRefPath(refPath) {
  return refPath.split('/').map(encodeURIComponent).join('/')
}

function parseGitHubResponse(responseBody) {
  if (!responseBody) {
    return {}
  }

  try {
    return JSON.parse(responseBody)
  } catch {
    return {
      message: responseBody,
    }
  }
}

function getGitHubErrorMessage(data, status) {
  if (typeof data.message === 'string') {
    return data.message
  }

  return `GitHub API request failed with status ${status}`
}
