#!/usr/bin/env node
/**
 * Report monthly Cloudflare Pages billable build usage for the account.
 *
 * Lists all Pages projects and counts non-skipped deployments since the start
 * of the current UTC month. Prints a table and grand total against the 500-build
 * monthly limit.
 *
 * USAGE:
 *   node report-build-usage.mjs
 *
 * ENV VARS:
 *   CF_ACCOUNT_ID  (required)  Cloudflare account ID
 *   CF_API_TOKEN   (required)  Cloudflare API token
 *
 * API TOKEN PERMISSIONS (https://dash.cloudflare.com/profile/api-tokens):
 *   Account > Cloudflare Pages > Read
 *   Scope: Account Resources > Include > <your account>
 */

import { getCfCredentials, cfFetch } from './cf-api.mjs'

const { accountId, apiToken } = getCfCredentials()

const concurrencyArg = process.argv.find((a) => a.startsWith('--concurrency='))
const concurrency = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 2

const now = new Date()
const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

async function getAllProjects() {
  const projects = []
  let page = 1
  while (true) {
    const data = await cfFetch(accountId, apiToken, `projects?page=${page}`)
    const result = data.result ?? []
    if (result.length === 0) break
    projects.push(...result.map((p) => p.name))
    page++
  }
  return projects
}

function countBillable(deployments) {
  return deployments.filter((d) => new Date(d.created_on) >= startOfMonth && !d.is_skipped).length
}

async function getMonthlyBuildCount(projectName) {
  const deploymentsPath = (page) => `projects/${projectName}/deployments?page=${page}`

  const first = await cfFetch(accountId, apiToken, deploymentsPath(1))
  const totalPages = first.result_info?.total_pages ?? 1
  let count = countBillable(first.result ?? [])

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => cfFetch(accountId, apiToken, deploymentsPath(i + 2))),
    )
    for (const data of rest) count += countBillable(data.result ?? [])
  }

  return count
}

async function mapConcurrent(items, concurrency, fn) {
  const results = new Array(items.length)
  let idx = 0
  async function worker() {
    while (idx < items.length) {
      const i = idx++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

async function main() {
  console.log('Scanning Cloudflare account for Pages projects...')
  const projects = await getAllProjects()

  if (projects.length === 0) {
    console.log('No Pages projects found.')
    return
  }

  console.log(`Found ${projects.length} project(s). Counting billable builds for this month...\n`)

  const rows = await mapConcurrent(projects, concurrency, async (project) => {
    const count = await getMonthlyBuildCount(project)
    return { Project: project, 'Billable Builds': count }
  })
  const grandTotal = rows.reduce((sum, r) => sum + r['Billable Builds'], 0)

  console.table(rows)
  console.log(`\n========================================`)
  console.log(`ACCOUNT BUILD USAGE: ${grandTotal} / 500`)
  console.log(`========================================`)
}

main().catch((err) => {
  process.stderr.write(`ERROR: ${err.message}\n`)
  process.exit(1)
})
