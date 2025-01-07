const owner = process.env.VERCEL_GIT_REPO_OWNER
const repo = process.env.VERCEL_GIT_REPO_SLUG
const pullRequestId = process.env.VERCEL_GIT_PULL_REQUEST_ID
const commitRef = process.env.VERCEL_GIT_COMMIT_REF

const APP_ARGV = '--app='
const appName = (() => {
  const argv = process.argv.find((arg) => arg.startsWith(APP_ARGV))
  return argv ? argv.slice(APP_ARGV.length) : undefined
})()

const PREVIEW_IGNORE_BRANCHES = ['main', 'configuration', 'release-please--branches--main']

/**
 * Skip the build if:
 *  - The branch is in the list of branches to ignore
 *  - The app preview is configured to be deployed manually, and label is not present in the PR
 */
async function shouldSkipBuild() {
  if (PREVIEW_IGNORE_BRANCHES.includes(commitRef)) {
    console.log(`Skipping build for branch ${commitRef}.`)
    return true
  }

  if (!pullRequestId) {
    console.log('No PR ID found. Proceeding with build.')
    return false
  }

  if (!appName) {
    console.log(`No appName label: ${appName}, found. Proceeding with build.`)
    return false
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${pullRequestId}/labels`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error('Failed to fetch PR labels:', response.statusText)
      return false // Proceed with the build in case of an error
    }

    const labels = await response.json()
    console.log(
      'PR Labels:',
      labels.map((label) => label.name),
    )
    const hasAppLabel = labels.some((label) => label.name === appName)

    if (hasAppLabel) {
      console.log(`Found label: ${appName}. Proceeding with build.`)
    } else {
      console.log(`Label ${appName} not found. Skipping build.`)
    }

    // Skip the build if the PR doesn't have the app label
    return !hasAppLabel
  } catch (error) {
    console.error('Error fetching PR labels:', error)
    return false // Proceed with the build in case of an error
  }
}

shouldSkipBuild().then((skip) => {
  if (skip) {
    console.log('Skipping build.')
    process.exit(0)
  } else {
    console.log('Proceeding with build.')
    process.exit(1)
  }
})
