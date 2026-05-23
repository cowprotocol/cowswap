import { strict as assert } from 'node:assert'
import { resolve } from 'node:path'
import { test } from 'node:test'

import { parseChecklist } from './checklist'

test('parseChecklist reads each test sheet and ignores Dashboard', async () => {
  const xlsxPath = resolve(__dirname, '../../../../e2e-checklist.xlsx')
  const checklist = await parseChecklist(xlsxPath)
  const sheetNames = checklist.sheets.map((s) => s.name)
  assert.deepEqual(sheetNames.sort(), [
    'AccountOverview',
    'CrossChain',
    'Hooks',
    'LimitOrders',
    'MarketOrders',
    'RWA',
    'SafeWallet',
    'SmartAccounts',
    'TWAPOrders',
    'UIUX',
    'WalletConnection',
  ])
  const market = checklist.sheets.find((s) => s.name === 'MarketOrders')
  assert.ok(market)
  assert.equal(market.rows[0]?.id, 'MO-01')
  assert.equal(market.rows.length, 79)
})
