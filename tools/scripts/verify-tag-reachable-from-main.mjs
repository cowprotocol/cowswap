#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

function runGit(cwd, args) {
  return spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function formatGitFailure(result, command) {
  const stderr = result.stderr.trim()
  const stdout = result.stdout.trim()
  const details = stderr || stdout

  return details ? `${command} failed: ${details}` : `${command} failed`
}

export function verifyTagReachableFromMain({
  cwd = process.cwd(),
  remote = 'origin',
  branch = 'main',
  sha = process.env.DEPLOY_SHA ?? process.env.GITHUB_SHA,
  ref = process.env.DEPLOY_REF ?? process.env.GITHUB_REF ?? sha,
} = {}) {
  if (!sha) {
    throw new Error('DEPLOY_SHA or GITHUB_SHA must be set')
  }

  const fetchResult = runGit(cwd, ['fetch', '--no-tags', remote, branch])

  if (fetchResult.status !== 0) {
    throw new Error(formatGitFailure(fetchResult, `git fetch --no-tags ${remote} ${branch}`))
  }

  const ancestryResult = runGit(cwd, ['merge-base', '--is-ancestor', sha, 'FETCH_HEAD'])

  if (ancestryResult.status === 0) {
    return
  }

  if (ancestryResult.status === 1) {
    const error = new Error(`Refusing to deploy ${ref} because ${sha} is not reachable from ${remote}/${branch}.`)
    error.exitCode = 1
    throw error
  }

  throw new Error(formatGitFailure(ancestryResult, `git merge-base --is-ancestor ${sha} FETCH_HEAD`))
}

function main() {
  try {
    verifyTagReachableFromMain()
  } catch (error) {
    console.error(error.message)
    process.exit(error.exitCode ?? 1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
