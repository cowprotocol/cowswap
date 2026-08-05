import { writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'

import { parseChecklist } from './checklist'

async function main(): Promise<void> {
  const xlsxPath = resolve(__dirname, '../../../../e2e-checklist.xlsx')
  const outPath = resolve(__dirname, '../checklist/checklist.json')
  const checklist = await parseChecklist(xlsxPath)
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, JSON.stringify(checklist, null, 2))
  const total = checklist.sheets.reduce((n, s) => n + s.rows.length, 0)
  console.log(`Wrote ${outPath} (${checklist.sheets.length} sheets, ${total} rows)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
