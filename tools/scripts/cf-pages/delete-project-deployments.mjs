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
 *   CF_PROJECT_NAME  (required)  CF Pages project name
 *
 * API TOKEN PERMISSIONS (https://dash.cloudflare.com/profile/api-tokens):
 *   Account > Cloudflare Pages > Edit
 *   Scope: Account Resources > Include > <your account>
 */

import { cfFetch, getCfCredentials } from './cf-api.mjs'

const { accountId, apiToken } = getCfCredentials()
const projectName = process.env.CF_PROJECT_NAME

if (!projectName) {
  process.stderr.write('No project name provided. CF_PROJECT_NAME is required')
  process.exit(1)
}

const MAX_ATTEMPTS = 3

async function main() {
  const attempts = new Map()

  while (true) {
    console.log('Fetching a batch of deployments...')

    const data = await cfFetch(accountId, apiToken, `projects/${projectName}/deployments`)
    const allIds = (data.result ?? []).map((d) => d.id)
    const ids = allIds.filter((id) => (attempts.get(id) ?? 0) < MAX_ATTEMPTS)

    if (ids.length === 0) {
      if (allIds.length > 0) {
        console.error(`WARNING: ${allIds.length} deployment(s) could not be deleted after ${MAX_ATTEMPTS} attempts.`)
      } else {
        console.log('No more deployments found. It is now safe to delete the project.')
      }
      break
    }

    console.log(`Deleting ${ids.length} deployment(s)...`)

    await Promise.all(
      ids.map(async (id) => {
        try {
          await cfFetch(accountId, apiToken, `projects/${projectName}/deployments/${id}`, { method: 'DELETE' })
          console.log(`Deleted deployment: ${id}`)
        } catch (err) {
          const count = (attempts.get(id) ?? 0) + 1
          attempts.set(id, count)
          if (count >= MAX_ATTEMPTS) {
            console.error(`WARNING: Giving up on deployment ${id} after ${count} failed attempts: ${err.message}`)
          } else {
            console.error(`WARNING: Could not delete deployment ${id} (attempt ${count}/${MAX_ATTEMPTS}): ${err.message}`)
          }
        }
      }),
    )
  }
}

main().catch((err) => {
  process.stderr.write(`ERROR: ${err.message}\n`)
  process.exit(1)
})
