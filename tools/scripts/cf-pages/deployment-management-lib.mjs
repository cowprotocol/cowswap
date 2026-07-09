const DEFAULT_LIMIT = 10

function requireValue(flag, args, i) {
  if (i + 1 >= args.length || args[i + 1].startsWith('-')) {
    throw new Error(`${flag} requires a value`)
  }
  return args[i + 1]
}

function parsePositiveInteger(value, name) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`)
  }
  return parsed
}

export function parseListArgs(args) {
  let projectName = ''
  let limit = DEFAULT_LIMIT
  let hasPositionalLimit = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--limit') {
      limit = parsePositiveInteger(requireValue(arg, args, i), '--limit')
      i++
    } else if (arg.startsWith('--limit=')) {
      limit = parsePositiveInteger(arg.slice('--limit='.length), '--limit')
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`)
    } else if (!projectName) {
      projectName = arg
    } else if (!hasPositionalLimit) {
      limit = parsePositiveInteger(arg, 'limit')
      hasPositionalLimit = true
    } else {
      throw new Error(`Unexpected argument: ${arg}`)
    }
  }

  if (!projectName) throw new Error('project name is required')

  return { projectName, limit }
}

export function parseRollbackArgs(args) {
  let projectName = ''
  let deploymentId = ''

  for (const arg of args) {
    if (arg.startsWith('-')) {
      if (!projectName) throw new Error('project name is required')
      if (!deploymentId) throw new Error('deployment id is required')
      throw new Error(`Unexpected argument: ${arg}`)
    }
    if (!projectName) {
      projectName = arg
      continue
    }
    if (deploymentId) throw new Error(`Unexpected argument: ${arg}`)
    deploymentId = arg
  }

  if (!projectName) throw new Error('project name is required')
  if (!deploymentId) throw new Error('deployment id is required')

  return { projectName, deploymentId }
}

function shortCommit(commitHash) {
  return commitHash ? commitHash.slice(0, 12) : ''
}

function formatDateTime(dateTime) {
  if (!dateTime) return ''

  const value = String(dateTime)
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/)

  return match ? `${match[1]} ${match[2]}` : value
}

function deploymentRow(deployment, currentDeploymentId) {
  const metadata = deployment.deployment_trigger?.metadata ?? {}
  const latestStage = deployment.latest_stage ?? {}

  return {
    Current: deployment.id === currentDeploymentId ? '➡️' : undefined,
    Id: deployment.short_id ?? '',
    Created: formatDateTime(deployment.created_on),
    Stage: latestStage.name ?? '',
    Status: latestStage.status ?? '',
    Commit: shortCommit(metadata.commit_hash),
    URL: deployment.url ?? '',
  }
}

export function summarizeProductionDeployments(deployments, currentDeployment) {
  const currentDeploymentId = currentDeployment?.id ?? ''
  const currentDeploymentInList =
    currentDeploymentId.length > 0 && deployments.some((deployment) => deployment.id === currentDeploymentId)

  return {
    rows: deployments.map((deployment) => deploymentRow(deployment, currentDeploymentId)),
    currentDeploymentInList,
    currentDeploymentOutsideList:
      currentDeployment && !currentDeploymentInList ? deploymentRow(currentDeployment, currentDeploymentId) : null,
  }
}

export function formatDeploymentTable(rows) {
  if (rows.length === 0) return ''

  const columns = Object.keys(rows[0])
  const widths = columns.map((column) =>
    Math.max(column.length, ...rows.map((row) => String(row[column] ?? '').length)),
  )

  function formatLine(values) {
    return values.map((value, i) => String(value ?? '').padEnd(widths[i])).join('  ')
  }

  return [
    formatLine(columns),
    widths.map((width) => '-'.repeat(width)).join('  '),
    ...rows.map((row) => formatLine(columns.map((column) => row[column]))),
  ].join('\n')
}
