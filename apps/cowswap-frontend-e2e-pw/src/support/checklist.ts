import ExcelJS from 'exceljs'

export interface ChecklistRow {
  id: string
  name: string
  priority: string
  type: string
}

export interface ChecklistSheet {
  name: string
  rows: ChecklistRow[]
}

export interface Checklist {
  generatedAt: string
  sheets: ChecklistSheet[]
}

const TEST_SHEETS = new Set([
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

const ID_PATTERN = /^[A-Z]{2,3}-\d{2,3}$/

function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (typeof v === 'object') {
    if ('richText' in v && Array.isArray((v as { richText: unknown[] }).richText)) {
      return (v as { richText: { text: string }[] }).richText.map((r) => r.text).join('')
    }
    if ('text' in v) return String((v as { text: unknown }).text)
    if ('result' in v) return String((v as { result: unknown }).result)
  }
  return ''
}

export async function parseChecklist(xlsxPath: string): Promise<Checklist> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(xlsxPath)
  const sheets: ChecklistSheet[] = []
  for (const ws of wb.worksheets) {
    if (!TEST_SHEETS.has(ws.name)) continue
    const rows: ChecklistRow[] = []
    ws.eachRow((row) => {
      const id = cellText(row.getCell(1).value).trim()
      if (!ID_PATTERN.test(id)) return
      rows.push({
        id,
        name: cellText(row.getCell(2).value).trim(),
        priority: cellText(row.getCell(3).value).trim(),
        type: cellText(row.getCell(4).value).trim(),
      })
    })
    sheets.push({ name: ws.name, rows })
  }
  return { generatedAt: new Date().toISOString(), sheets }
}
