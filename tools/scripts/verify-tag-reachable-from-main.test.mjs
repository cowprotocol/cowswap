import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { verifyTagReachableFromMain } from './verify-tag-reachable-from-main.mjs'

function runGit(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

function createRepoFixture() {
  const rootDir = mkdtempSync(path.join(tmpdir(), 'verify-tag-reachable-'))
  const originDir = path.join(rootDir, 'origin.git')
  const seedDir = path.join(rootDir, 'seed')

  runGit(rootDir, ['init', '--bare', '--initial-branch=main', originDir])
  runGit(rootDir, ['init', '--initial-branch=main', seedDir])
  runGit(seedDir, ['config', 'user.name', 'Test User'])
  runGit(seedDir, ['config', 'user.email', 'test@example.com'])

  writeFileSync(path.join(seedDir, 'state.txt'), 'base\n')
  runGit(seedDir, ['add', 'state.txt'])
  runGit(seedDir, ['commit', '-m', 'base'])
  runGit(seedDir, ['branch', '-M', 'main'])
  const reachableSha = runGit(seedDir, ['rev-parse', 'HEAD'])

  writeFileSync(path.join(seedDir, 'state.txt'), 'main-2\n')
  runGit(seedDir, ['commit', '-am', 'main-2'])
  writeFileSync(path.join(seedDir, 'state.txt'), 'main-3\n')
  runGit(seedDir, ['commit', '-am', 'main-3'])

  runGit(seedDir, ['checkout', '-q', '-b', 'feature', reachableSha])
  writeFileSync(path.join(seedDir, 'feature.txt'), 'feature\n')
  runGit(seedDir, ['add', 'feature.txt'])
  runGit(seedDir, ['commit', '-m', 'feature'])
  const unreachableSha = runGit(seedDir, ['rev-parse', 'HEAD'])

  runGit(seedDir, ['remote', 'add', 'origin', originDir])
  runGit(seedDir, ['push', '-q', 'origin', 'main', 'feature'])

  return { originDir, reachableSha, rootDir, unreachableSha }
}

function createDetachedCheckout(originDir, sha) {
  const checkoutDir = mkdtempSync(path.join(tmpdir(), 'verify-tag-checkout-'))

  runGit(checkoutDir, ['init', '-q', '--initial-branch=main'])
  runGit(checkoutDir, ['remote', 'add', 'origin', originDir])
  runGit(checkoutDir, ['fetch', '-q', '--depth=1', 'origin', sha])
  runGit(checkoutDir, ['checkout', '-q', 'FETCH_HEAD'])

  return checkoutDir
}

test('accepts a non-tip main commit after fetching full main history', (t) => {
  const { originDir, reachableSha, rootDir } = createRepoFixture()
  const checkoutDir = createDetachedCheckout(originDir, reachableSha)

  t.after(() => {
    rmSync(rootDir, { force: true, recursive: true })
    rmSync(checkoutDir, { force: true, recursive: true })
  })

  assert.doesNotThrow(() =>
    verifyTagReachableFromMain({
      cwd: checkoutDir,
      ref: 'refs/tags/cowswap-v1.2.3',
      sha: reachableSha,
    }),
  )
})

test('rejects commits that are not reachable from main', (t) => {
  const { originDir, rootDir, unreachableSha } = createRepoFixture()
  const checkoutDir = createDetachedCheckout(originDir, unreachableSha)

  t.after(() => {
    rmSync(rootDir, { force: true, recursive: true })
    rmSync(checkoutDir, { force: true, recursive: true })
  })

  assert.throws(
    () =>
      verifyTagReachableFromMain({
        cwd: checkoutDir,
        ref: 'refs/tags/cowswap-v1.2.3',
        sha: unreachableSha,
      }),
    /not reachable from origin\/main/,
  )
})

test('prefers deploy env over ambient GitHub workflow env', (t) => {
  const { originDir, reachableSha, rootDir, unreachableSha } = createRepoFixture()
  const checkoutDir = createDetachedCheckout(originDir, reachableSha)
  const originalDeployRef = process.env.DEPLOY_REF
  const originalDeploySha = process.env.DEPLOY_SHA
  const originalGitHubRef = process.env.GITHUB_REF
  const originalGitHubSha = process.env.GITHUB_SHA

  t.after(() => {
    if (originalDeployRef === undefined) {
      delete process.env.DEPLOY_REF
    } else {
      process.env.DEPLOY_REF = originalDeployRef
    }

    if (originalDeploySha === undefined) {
      delete process.env.DEPLOY_SHA
    } else {
      process.env.DEPLOY_SHA = originalDeploySha
    }

    if (originalGitHubRef === undefined) {
      delete process.env.GITHUB_REF
    } else {
      process.env.GITHUB_REF = originalGitHubRef
    }

    if (originalGitHubSha === undefined) {
      delete process.env.GITHUB_SHA
    } else {
      process.env.GITHUB_SHA = originalGitHubSha
    }

    rmSync(rootDir, { force: true, recursive: true })
    rmSync(checkoutDir, { force: true, recursive: true })
  })

  process.env.DEPLOY_REF = 'refs/tags/cowswap-v1.2.3'
  process.env.DEPLOY_SHA = reachableSha
  process.env.GITHUB_REF = 'refs/heads/develop'
  process.env.GITHUB_SHA = unreachableSha

  assert.doesNotThrow(() =>
    verifyTagReachableFromMain({
      cwd: checkoutDir,
    }),
  )
})
