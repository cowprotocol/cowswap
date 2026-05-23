import { readFile, writeFile, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Checklist } from '../support/checklist'

type State = 'automated' | 'manual' | 'todo'

interface Found {
  id: string
  state: State
  reason?: string
}

const TEST_PATTERN =
  /test\(\s*(['"`])\[([A-Z]{2,3}-\d{2,3})\][\s\S]*?\1\s*(?:,\s*\{[^}]*annotation:\s*\{[^}]*type:\s*['"`](manual|todo)['"`][^}]*description:\s*(['"`])([\s\S]*?)\4)?/g

function parseFile(content: string): Found[] {
  const found: Found[] = []
  for (const m of content.matchAll(TEST_PATTERN)) {
    const id = m[2]
    const type = m[3]
    const reason = m[5]
    if (type === 'manual' || type === 'todo') {
      found.push({ id, state: type, reason })
    } else {
      found.push({ id, state: 'automated' })
    }
  }
  return found
}

export interface CoverageSheetReport {
  name: string
  automated: string[]
  manual: { id: string; reason?: string }[]
  todo: { id: string; reason?: string }[]
  missing: string[]
  stray: string[]
}

export interface CoverageReport {
  generatedAt: string
  sheets: CoverageSheetReport[]
  totals: { automated: number; manual: number; todo: number; missing: number; total: number }
}

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

export function computeCoverage(checklist: Checklist, specs: Map<string, string>): CoverageReport {
  const sheets: CoverageSheetReport[] = []
  const tot = { automated: 0, manual: 0, todo: 0, missing: 0, total: 0 }
  for (const sheet of checklist.sheets) {
    const file = SHEET_TO_FILE[sheet.name]
    const content = specs.get(file) ?? ''
    const found = parseFile(content)
    const byId = new Map(found.map((f) => [f.id, f]))
    const automated: string[] = []
    const manual: { id: string; reason?: string }[] = []
    const todo: { id: string; reason?: string }[] = []
    const missing: string[] = []
    for (const row of sheet.rows) {
      const f = byId.get(row.id)
      if (!f) {
        missing.push(row.id)
        continue
      }
      if (f.state === 'manual') manual.push({ id: row.id, reason: f.reason })
      else if (f.state === 'todo') todo.push({ id: row.id, reason: f.reason })
      else automated.push(row.id)
      byId.delete(row.id)
    }
    const stray = [...byId.keys()]
    sheets.push({ name: sheet.name, automated, manual, todo, missing, stray })
    tot.automated += automated.length
    tot.manual += manual.length
    tot.todo += todo.length
    tot.missing += missing.length
    tot.total += sheet.rows.length
  }
  return { generatedAt: new Date().toISOString(), sheets, totals: tot }
}

function renderMarkdown(r: CoverageReport): string {
  const rows = r.sheets
    .map((s) => `| ${s.name} | ${s.automated.length} | ${s.manual.length} | ${s.todo.length} | ${s.missing.length} |`)
    .join('\n')
  return `# Coverage report\n\nGenerated: ${r.generatedAt}\n\n| Sheet | Automated | Manual | TODO | Missing |\n|---|---|---|---|---|\n${rows}\n| **Total** | ${r.totals.automated} | ${r.totals.manual} | ${r.totals.todo} | ${r.totals.missing} |\n`
}

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url))
  const checklist = JSON.parse(await readFile(resolve(here, 'checklist.json'), 'utf8')) as Checklist
  const testsDir = resolve(here, '..', 'tests')
  const files = await readdir(testsDir)
  const specs = new Map<string, string>()
  for (const f of files) {
    if (f.endsWith('.spec.ts')) specs.set(f, await readFile(resolve(testsDir, f), 'utf8'))
  }
  const report = computeCoverage(checklist, specs)
  const md = renderMarkdown(report)
  const outPath = resolve(here, '..', '..', 'coverage-report.md')
  await writeFile(outPath, md)
  console.log(md)
  if (report.totals.missing > 0 || report.sheets.some((s) => s.stray.length > 0)) {
    console.error('Coverage report failed: missing or stray IDs')
    process.exit(1)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
