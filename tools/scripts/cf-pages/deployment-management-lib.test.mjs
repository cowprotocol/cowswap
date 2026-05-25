import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  formatDeploymentTable,
  parseListArgs,
  parseRollbackArgs,
  summarizeProductionDeployments,
} from './deployment-management-lib.mjs'

function deployment(id, createdOn = '2026-05-25T10:00:00.123Z') {
  return {
    id,
    short_id: id.slice(0, 8),
    created_on: createdOn,
    url: `https://${id}.example.pages.dev`,
    latest_stage: { name: 'deploy', status: 'success' },
    deployment_trigger: {
      metadata: {
        branch: 'main',
        commit_hash: `${id}abcdef1234567890`,
      },
    },
  }
}

describe('parseListArgs', () => {
  it('requires a project name and defaults to the last 10 production deployments', () => {
    assert.deepEqual(parseListArgs(['cow-fi']), { projectName: 'cow-fi', limit: 10 })
    assert.throws(() => parseListArgs([]), /project name is required/)
  })

  it('accepts an explicit limit by flag or positional parameter', () => {
    assert.deepEqual(parseListArgs(['cow-fi', '--limit', '3']), { projectName: 'cow-fi', limit: 3 })
    assert.deepEqual(parseListArgs(['cow-fi', '--limit=4']), { projectName: 'cow-fi', limit: 4 })
    assert.deepEqual(parseListArgs(['cow-fi', '5']), { projectName: 'cow-fi', limit: 5 })
  })

  it('rejects missing or invalid limits', () => {
    assert.throws(() => parseListArgs(['--limit']), /--limit requires a value/)
    assert.throws(() => parseListArgs(['--limit', '--other']), /--limit requires a value/)
    assert.throws(() => parseListArgs(['--limit', '0']), /--limit must be a positive integer/)
  })
})

describe('summarizeProductionDeployments', () => {
  it('marks the canonical deployment when it is in the listed deployments', () => {
    const current = deployment('current123')
    const summary = summarizeProductionDeployments([deployment('older123'), current], current)

    assert.equal(summary.currentDeploymentInList, true)
    assert.equal(summary.currentDeploymentOutsideList, null)
    assert.equal(summary.rows[0].Current, '-')
    assert.notEqual(summary.rows[1].Current, summary.rows[0].Current)
  })

  it('returns the canonical deployment separately when it is outside the listed deployments', () => {
    const current = deployment('current123')
    const summary = summarizeProductionDeployments([deployment('older123')], current)

    assert.equal(summary.currentDeploymentInList, false)
    assert.equal(summary.currentDeploymentOutsideList.Id, 'current1')
  })

  it('formats created dates without milliseconds or timezone information', () => {
    const summary = summarizeProductionDeployments([deployment('older123', '2026-05-25T10:15:30.987+00:00')], null)

    assert.equal(summary.rows[0].Created, '2026-05-25 10:15:30')
  })
})

describe('formatDeploymentTable', () => {
  it('prints string values without single quote wrappers', () => {
    const summary = summarizeProductionDeployments([deployment('older123')], null)
    const table = formatDeploymentTable(summary.rows)

    assert.match(table, /older123/)
    assert.doesNotMatch(table, /'older123'/)
    assert.doesNotMatch(table, /'success'/)
  })
})

describe('parseRollbackArgs', () => {
  it('requires project name and deployment id', () => {
    assert.deepEqual(parseRollbackArgs(['cow-fi', 'deployment123']), {
      projectName: 'cow-fi',
      deploymentId: 'deployment123',
    })
    assert.throws(() => parseRollbackArgs([]), /project name is required/)
    assert.throws(() => parseRollbackArgs(['cow-fi']), /deployment id is required/)
    assert.throws(() => parseRollbackArgs(['--project']), /project name is required/)
    assert.throws(() => parseRollbackArgs(['cow-fi', 'one', 'two']), /Unexpected argument: two/)
  })
})
