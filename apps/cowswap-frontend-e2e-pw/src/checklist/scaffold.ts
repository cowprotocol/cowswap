import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { Checklist } from '../support/checklist'

const SHEET_TO_FILE: Record<string, string> = {
  WalletConnection: 'wallet-connection.spec.ts',
  SafeWallet: 'safe-wallet.spec.ts',
  SmartAccounts: 'smart-accounts.spec.ts',
  MarketOrders: 'market-orders.spec.ts',
  LimitOrders: 'limit-orders.spec.ts',
  TWAPOrders: 'twap-orders.spec.ts',
  CrossChain: 'cross-chain.spec.ts',
  UIUX: 'ui-ux.spec.ts',
  Hooks: 'hooks.spec.ts',
  RWA: 'rwa.spec.ts',
  AccountOverview: 'account-overview.spec.ts',
}

const MANUAL_IDS = new Set([
  'WC-02',
  'WC-03',
  'WC-04',
  'WC-08',
  'WC-09',
  'WC-10',
  'WC-11',
  'WC-13',
  'SW-03',
  'SW-04',
  'SW-05',
  'SW-06',
  'SW-07',
  'SW-08',
  'SW-09',
  'SW-10',
  'SW-11',
  'SW-12',
  'SW-13',
  'SW-14',
  'SW-15',
  'SW-16',
  'SA-04',
  'SA-05',
  'SA-06',
  'SA-07',
  'SA-08',
  'SA-09',
  'SA-10',
  'SA-11',
  'SA-12',
  'UI-02',
  'UI-03',
])

function reasonFor(id: string): { kind: 'manual' | 'todo'; description: string } {
  if (MANUAL_IDS.has(id)) {
    return { kind: 'manual', description: 'requires real wallet or environment per spec §6.4' }
  }
  return { kind: 'todo', description: 'implement in upcoming milestone' }
}

function escapeName(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

async function main(): Promise<void> {
  const checklist = JSON.parse(await readFile(resolve(__dirname, 'checklist.json'), 'utf8')) as Checklist
  for (const sheet of checklist.sheets) {
    const filename = SHEET_TO_FILE[sheet.name]
    if (!filename) {
      console.warn(`Unmapped sheet: ${sheet.name}`)
      continue
    }
    const filePath = resolve(__dirname, '..', 'tests', filename)
    const current = await readFile(filePath, 'utf8').catch(() => '')
    const existingIds = new Set([...current.matchAll(/\[([A-Z]{2,3}-\d{2,3})\]/g)].map((m) => m[1]))
    const missing = sheet.rows.filter((r) => !existingIds.has(r.id))
    if (missing.length === 0) {
      console.log(`No additions for ${filename}`)
      continue
    }
    const lines = missing.map((row) => {
      const { kind, description } = reasonFor(row.id)
      const body = kind === 'manual' ? 'test.skip()' : 'test.fixme()'
      const annotation = `{ annotation: { type: '${kind}', description: '${escapeName(description)}' } }`
      return `  test('[${row.id}] ${escapeName(row.name)}', ${annotation}, async () => { ${body} })`
    })
    const block = lines.join('\n')

    let next: string
    const closeIdx = current.lastIndexOf('})')
    if (closeIdx === -1) {
      // No existing describe; create one with the right name.
      next = `import { test } from '../fixtures'\n\ntest.describe('${sheet.name}', () => {\n${block}\n})\n`
    } else {
      // Insert block just before the final '})' of the last describe.
      next = `${current.slice(0, closeIdx).replace(/\s*$/, '\n')}${block}\n${current.slice(closeIdx)}`
    }
    await writeFile(filePath, next)
    console.log(`Updated ${filename} (+${missing.length})`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
