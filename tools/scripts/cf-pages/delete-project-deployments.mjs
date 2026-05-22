#!/usr/bin/env node
/**
 * Delete all deployments for a Cloudflare Pages project.
 *
 * Run this before deleting the project itself — Cloudflare requires all
 * deployments to be removed first. Fetches up to 25 deployments per batch,
 * deletes them in parallel, and loops until none remain.
 *
 * USAGE:
 *   node delete-project-deployments.mjs
 *
 * ENV VARS:
 *   CF_ACCOUNT_ID    (required)  Cloudflare account ID
 *   CF_API_TOKEN     (required)  Cloudflare API token
 *   CF_PROJECT_NAME  (optional)  CF Pages project name. Default: swap-dev
 *
 * API TOKEN PERMISSIONS (https://dash.cloudflare.com/profile/api-tokens):
 *   Account > Cloudflare Pages > Edit
 *   Scope: Account Resources > Include > <your account>
 */

import { getCfCredentials, cfFetch } from './cf-api.mjs'

const { accountId, apiToken } = getCfCredentials()
const projectName = process.env.CF_PROJECT_NAME ?? 'swap-dev'

async function main() {
  while (true) {
    console.log('Fetching a batch of deployments...')

    const data = await cfFetch(accountId, apiToken, `projects/${projectName}/deployments`)
    const ids = (data.result ?? []).map((d) => d.id)

    if (ids.length === 0) {
      console.log('No more deployments found. It is now safe to delete the project.')
      break
    }

    console.log(`Deleting ${ids.length} deployment(s)...`)

    await Promise.all(
      ids.map(async (id) => {
        try {
          await cfFetch(accountId, apiToken, `projects/${projectName}/deployments/${id}`, { method: 'DELETE' })
          console.log(`Deleted deployment: ${id}`)
        } catch (err) {
          console.error(`WARNING: Could not delete deployment ${id}: ${err.message}`)
        }
      }),
    )
  }
}

main().catch((err) => {
  process.stderr.write(`ERROR: ${err.message}\n`)
  process.exit(1)
})
