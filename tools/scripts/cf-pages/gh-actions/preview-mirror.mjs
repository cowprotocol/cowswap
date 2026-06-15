#!/usr/bin/env node

/**
 * GitHub Actions entrypoint for Cloudflare Pages fork-preview mirroring.
 *
 * This script is intentionally separate from the other scripts in
 * `tools/scripts/cf-pages`, which are local/operator Cloudflare API utilities.
 * It is meant to run only inside the `cf-pages-preview-mirror.yml` GitHub
 * Actions workflow with GitHub's event context available via
 * `GITHUB_EVENT_PATH`, `GITHUB_REPOSITORY`, `GITHUB_ACTOR`, and `GITHUB_TOKEN`.
 *
 * It does not use Cloudflare credentials. Its only job is to create, update,
 * or delete an upstream GitHub preview branch and mirror PR so the native
 * Cloudflare Pages Git integration can build and comment on that PR. On fork
 * pushes, it only refreshes the managed approval comment with the new target
 * SHA; it does not mirror code until a trusted maintainer checks the box.
 */

import fs from 'node:fs'

import { createGitHubClient, handlePreviewMirrorEvent } from './preview-mirror-lib.mjs'

async function main() {
  const eventPath = getRequiredEnv('GITHUB_EVENT_PATH')
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
  const repoFullName = getRequiredEnv('GITHUB_REPOSITORY')
  const token = getRequiredEnv('GITHUB_TOKEN')
  const actor = getRequiredEnv('GITHUB_ACTOR')
  const client = createGitHubClient({
    repoFullName,
    token,
  })

  const result = await handlePreviewMirrorEvent({
    actor,
    client,
    event,
    options: {
      branchPrefix: process.env.PREVIEW_BRANCH_PREFIX,
      repoFullName,
      triggerLabel: process.env.PREVIEW_TRIGGER_LABEL,
    },
  })

  process.stdout.write(`${JSON.stringify(result)}\n`)
}

function getRequiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} env var is required.`)
  }

  return value
}

main().catch((error) => {
  process.stderr.write(`ERROR: ${error.message}\n`)
  process.exit(1)
})
