#!/usr/bin/env node
/**
 * Roll back a Cloudflare Pages project to a production deployment.
 *
 * USAGE:
 *   node rollback-production-deployment.mjs <project-name> <deployment-id>
 *
 * ENV VARS:
 *   CF_ACCOUNT_ID  (required)  Cloudflare account ID
 *   CF_API_TOKEN   (required)  Cloudflare API token
 *
 * API TOKEN PERMISSIONS (https://dash.cloudflare.com/profile/api-tokens):
 *   Account > Cloudflare Pages > Edit
 *   Scope: Account Resources > Include > <your account>
 */

import { readFileSync } from 'node:fs'
import { cfError, cfFetch, getCfCredentials } from './cf-api.mjs'
import { parseRollbackArgs } from './deployment-management-lib.mjs'

const args = process.argv.slice(2)

if (args.includes('--help')) {
  const source = readFileSync(new URL(import.meta.url), 'utf8')
  const block = source.match(/\/\*\*([\s\S]*?)\*\//)?.[1] ?? ''
  process.stderr.write(block.replace(/^ \* ?/gm, '').trim() + '\n')
  process.exit(0)
}

let projectName
let deploymentId
try {
  const parsedArgs = parseRollbackArgs(args)
  projectName = parsedArgs.projectName
  deploymentId = parsedArgs.deploymentId
} catch (err) {
  cfError(err.message)
}

const { accountId, apiToken } = getCfCredentials()

async function main() {
  console.log(`Rolling back project '${projectName}' to deployment '${deploymentId}'...`)

  const data = await cfFetch(accountId, apiToken, `projects/${projectName}/deployments/${deploymentId}/rollback`, {
    method: 'POST',
  })
  const deployment = data.result

  console.log(`Done. Production rolled back to deployment: ${deployment?.id ?? deploymentId}`)
  if (deployment?.url) console.log(`URL: ${deployment.url}`)
}

main().catch((err) => {
  process.stderr.write(`ERROR: ${err.message}\n`)
  process.exit(1)
})
