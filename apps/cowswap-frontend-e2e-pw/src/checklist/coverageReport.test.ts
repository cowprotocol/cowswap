import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { computeCoverage } from './coverageReport'

const fakeChecklist = {
  generatedAt: 'x',
  sheets: [
    {
      name: 'MarketOrders',
      rows: [
        { id: 'MO-01', name: 'a', priority: 'High', type: 'Functional' },
        { id: 'MO-02', name: 'b', priority: 'Low', type: 'Functional' },
      ],
    },
  ],
}

const fakeSpecs = new Map<string, string>([
  [
    'market-orders.spec.ts',
    `
    test('[MO-01] a', async () => {})
    test('[MO-02] b', { annotation: { type: 'manual', description: 'x' } }, async () => { test.skip() })
  `,
  ],
])

test('computeCoverage classifies automated vs manual vs todo vs missing', () => {
  const r = computeCoverage(fakeChecklist, fakeSpecs)
  assert.equal(r.sheets[0].automated.length, 1)
  assert.equal(r.sheets[0].manual.length, 1)
  assert.equal(r.sheets[0].missing.length, 0)
})
