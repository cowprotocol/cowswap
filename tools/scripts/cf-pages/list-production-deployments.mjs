#!/usr/bin/env node
/**
 * List recent production Cloudflare Pages deployments and mark the current one.
 *
 * Fetches the project's canonical deployment to identify the build currently in
 * production. If that deployment is outside the requested list, prints it
 * separately after the recent production deployments table.
 *
 * USAGE:
 *   node list-production-deployments.mjs <project-name> [--limit <count>]
 *   node list-production-deployments.mjs <project-name> [count]
 *
 * ENV VARS:
 *   CF_ACCOUNT_ID  (required)  Cloudflare account ID
 *   CF_API_TOKEN   (required)  Cloudflare API token
 *
 * OPTIONS:
 *   --limit <count>  Number of recent production deployments to list. Default: 10
 *   --help           Show this help message
 *
 * API TOKEN PERMISSIONS (https://dash.cloudflare.com/profile/api-tokens):
 *   Account > Cloudflare Pages > Read
 *   Scope: Account Resources > Include > <your account>
 */

import { readFileSync } from 'node:fs'
import { cfError, cfFetch, getCfCredentials } from './cf-api.mjs'
import { formatDeploymentTable, parseListArgs, summarizeProductionDeployments } from './deployment-management-lib.mjs'

const args = process.argv.slice(2)

if (args.includes('--help')) {
  const source = readFileSync(new URL(import.meta.url), 'utf8')
  const block = source.match(/\/\*\*([\s\S]*?)\*\//)?.[1] ?? ''
  process.stderr.write(block.replace(/^ \* ?/gm, '').trim() + '\n')
  process.exit(0)
}

let projectName
let limit
try {
  const parsedArgs = parseListArgs(args)
  projectName = parsedArgs.projectName
  limit = parsedArgs.limit
} catch (err) {
  cfError(err.message)
}

const { accountId, apiToken } = getCfCredentials()

async function main() {
  console.log(`Fetching project ${projectName}...`)
  const projectData = await cfFetch(accountId, apiToken, `projects/${projectName}`)
  const currentDeployment = projectData.result?.canonical_deployment ?? null

  console.log(`Fetching last ${limit} production deployment(s)...`)
  const deploymentsData = await cfFetch(
    accountId,
    apiToken,
    `projects/${projectName}/deployments?env=production&per_page=${limit}&page=1`,
  )
  const deployments = deploymentsData.result ?? []
  const { rows, currentDeploymentInList, currentDeploymentOutsideList } = summarizeProductionDeployments(
    deployments,
    currentDeployment,
  )

  if (rows.length === 0) {
    console.log(`No production deployments found for ${projectName}.`)
  } else {
    console.log(`Last ${rows.length} production deployment(s) for ${projectName}:`)
    console.log(formatDeploymentTable(rows))
  }

  if (!currentDeployment) {
    console.log('\nCloudflare did not return a current production deployment.')
  } else if (currentDeploymentInList) {
    console.log(`\nCurrent production deployment: ${currentDeployment.id}`)
  } else {
    console.log('\nCurrent production deployment is outside the listed range:')
    console.log(formatDeploymentTable([currentDeploymentOutsideList]))
  }
}

main().catch((err) => {
  process.stderr.write(`ERROR: ${err.message}\n`)
  process.exit(1)
})
