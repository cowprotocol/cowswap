/**
 * Render claim codes as a print-ready PDF of cut-out cards (12 per page).
 *
 * Each card is the artwork at full bleed. The artwork reserves two zones — a
 * white splash panel for the message and a framed square for the QR — and this
 * script paints over their placeholder marks with the real text and a QR
 * pointing at `<base-url>/#/graffiti/claim?code=<code>`.
 *
 * Zone coordinates below are fractions of the card, measured from
 * assets/cows-in-love.png; `--text-box` / `--qr-box` override them for other
 * artwork. Usage: npm run claims:pdf -- --codes data/codes.txt
 * See docs/graffiti/OPERATIONS.md §"Print claim cards".
 */
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

import fs from 'node:fs'
import path from 'node:path'

import { PKG_ROOT } from '../src/config.js'

interface BlockMetrics {
  mainSize: number
  mainH: number
  subSize: number
  subH: number
  codeSize: number
  codeH: number
  blockH: number
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface CardText {
  main: string
  sub: string
}

interface Layout {
  cardW: number
  cardH: number
  originX: number
  originY: number
  qr: Box
  text: Box
  mainSize: number
  mainH: number
  subSize: number
  subH: number
  codeSize: number
  codeH: number
  blockTop: number
}

interface Options {
  codesFile: string
  out: string
  imagePath: string | null
  baseUrl: string
  text: CardText
  cols: number
  rows: number
  pageSize: PageSize
  marginMm: number
  textBox: Box
  qrBox: Box
  guides: boolean
  showCode: boolean
  limit: number | null
  fontDisplay: string | null
  fontBody: string | null
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
}

type PageSize = 'A4' | 'LETTER'

interface RenderContext {
  layout: Layout
  options: Options
}

/** pdfkit can read an image's dimensions, which its types leave out. */
type WithOpenImage = PDFKit.PDFDocument & {
  openImage(src: string): { width: number; height: number }
}

/**
 * Zones reserved by assets/cows-in-love.png, as fractions of the card.
 *
 * `text` is the solid-white interior of the splash panel, including the three
 * placeholder rules it is painted over; `qr` is the white square inside the
 * cyan frame, including its placeholder brackets.
 */
const ART_TEXT_BOX: Box = { x: 140 / 1254, y: 905 / 1254, w: 550 / 1254, h: 259 / 1254 }
/**
 * The three placeholder rules inside the splash panel, each covered separately:
 * a rule runs the full width of the panel at its own row, and the panel's
 * painted edge is ragged, so one rectangle over all three would spill onto the
 * wall behind it.
 */
const ART_RULE_COVERS: Box[] = [
  { x: 126 / 1254, y: 971 / 1254, w: 605 / 1254, h: 19 / 1254 },
  { x: 126 / 1254, y: 1042 / 1254, w: 606 / 1254, h: 18 / 1254 },
  { x: 131 / 1254, y: 1112 / 1254, w: 583 / 1254, h: 20 / 1254 },
]
const ART_QR_BOX: Box = { x: 844 / 1254, y: 863 / 1254, w: 327 / 1254, h: 322 / 1254 }
/** Corner radius of the artwork's QR frame, so the cover does not square it off. */
const QR_BOX_RADIUS = 26 / 1254

/** Quiet-zone modules drawn inside the QR box; the bright frame adds more. */
const QR_QUIET_ZONE = 2
/** Print below this module size and phone cameras start to miss codes. */
const MIN_MODULE_MM = 0.4

const COLORS = {
  main: '#E0189B',
  sub: '#2A0B4E',
  code: '#6E5C8A',
  panel: '#FFFFFF',
  qrDark: '#11002A',
  guide: '#9AA0AA',
  placeholder: '#D8DCE2',
}

const FONT_DISPLAY = 'display'
const FONT_BODY = 'body'
const BUNDLED_DISPLAY = path.resolve(PKG_ROOT, 'assets', 'fonts', 'PermanentMarker-Regular.ttf')
const BUNDLED_BODY = path.resolve(PKG_ROOT, 'assets', 'fonts', 'BarlowCondensed-SemiBold.ttf')

const PAGE_SIZES: Record<PageSize, [number, number]> = {
  A4: [595.28, 841.89],
  LETTER: [612, 792],
}

/** Headline size bounds, and what the smaller lines take from it. */
const MAIN_MAX_PT = 12
const MAIN_MIN_PT = 3.5
const SUB_RATIO = 0.72
const SUB_MIN_PT = 3.5
const CODE_MIN_PT = 3

/** Marker faces set loose; pulling the headline's lines together lets it print larger. */
const DISPLAY_LINE_GAP = -0.16

/** Gap between the message block's parts. */
const GAP_MM = 0.7
/** Crop-mark geometry outside the grid. */
const CROP_GAP_MM = 1
const CROP_LEN_MM = 3

main().catch((err: unknown) => {
  const error = err instanceof Error ? err : new Error(String(err))
  console.error(`[claims:pdf] ${error.message}`)
  process.exit(1)
})

/** The URL a QR encodes; the app serves the claim page behind a hash route. */
function claimUrl(baseUrl: string, code: string): string {
  return `${baseUrl}/#/graffiti/claim?code=${encodeURIComponent(code)}`
}

function codesFromJson(raw: string): string[] {
  const parsed: unknown = JSON.parse(raw)
  const list: unknown = Array.isArray(parsed) ? parsed : isRecord(parsed) ? parsed.codes : null

  if (!Array.isArray(list)) throw new Error('JSON codes file: expected an array or {codes:[...]}')

  return list.map((entry) => {
    if (typeof entry === 'string') return entry
    if (isRecord(entry) && typeof entry.code === 'string') return entry.code
    throw new Error('JSON codes file: entries must be strings or {code}')
  })
}

/**
 * Card geometry, measured once because every card carries the same text.
 *
 * Cards keep the artwork's aspect ratio and the grid is centred on the page,
 * so a square asset yields square cards with even paper around them. Inside
 * the splash panel the message block is centred vertically: headline (up to
 * two lines), submessage (up to three), then the code.
 */
function computeLayout(doc: PDFKit.PDFDocument, options: Options, aspect: number): Layout {
  const [pageW, pageH] = PAGE_SIZES[options.pageSize]
  const margin = mm(options.marginMm)
  const cardW = Math.min((pageW - 2 * margin) / options.cols, (pageH - 2 * margin) / options.rows / aspect)
  const cardH = cardW * aspect

  if (cardW <= 0) {
    throw new Error(`margin ${options.marginMm}mm leaves no room for a ${options.cols}x${options.rows} grid`)
  }

  const text = scaleBox(options.textBox, cardW, cardH)
  const block = fitBlock(doc, options, text)

  if (block.blockH > text.h) {
    console.error(
      `[claims:pdf] warning: message block is ${(block.blockH - text.h).toFixed(1)}pt taller than the panel; ` +
        `shorten --main-text/--sub-text or widen --text-box`,
    )
  }

  return {
    cardW,
    cardH,
    originX: (pageW - cardW * options.cols) / 2,
    originY: (pageH - cardH * options.rows) / 2,
    qr: scaleBox(options.qrBox, cardW, cardH),
    text,
    ...block,
    blockTop: Math.max((text.h - block.blockH) / 2, 0),
  }
}

function drawCard(doc: PDFKit.PDFDocument, code: string, x: number, y: number, ctx: RenderContext): void {
  const { layout, options } = ctx

  if (options.imagePath) {
    doc.image(options.imagePath, x, y, { width: layout.cardW, height: layout.cardH })
  } else {
    drawPlaceholderCard(doc, x, y, layout)
  }

  drawMessage(doc, code, x, y, ctx)
  drawQr(doc, code, x, y, ctx)
}

/** Crop marks in the paper margin; cards are full-bleed, so nothing is drawn across them. */
function drawCropMarks(doc: PDFKit.PDFDocument, options: Options, layout: Layout): void {
  const gridW = layout.cardW * options.cols
  const gridH = layout.cardH * options.rows
  const gap = mm(CROP_GAP_MM)
  const len = mm(CROP_LEN_MM)

  doc.save().lineWidth(0.4).strokeColor(COLORS.guide)

  for (let col = 0; col <= options.cols; col++) {
    const x = layout.originX + col * layout.cardW

    doc.moveTo(x, layout.originY - gap).lineTo(x, layout.originY - gap - len)
    doc.moveTo(x, layout.originY + gridH + gap).lineTo(x, layout.originY + gridH + gap + len)
  }

  for (let row = 0; row <= options.rows; row++) {
    const y = layout.originY + row * layout.cardH

    doc.moveTo(layout.originX - gap, y).lineTo(layout.originX - gap - len, y)
    doc.moveTo(layout.originX + gridW + gap, y).lineTo(layout.originX + gridW + gap + len, y)
  }

  doc.stroke().restore()
}

/**
 * Message block in the splash panel. The panel is repainted white first: the
 * artwork's three rules are placeholders for exactly this text.
 */
function drawMessage(doc: PDFKit.PDFDocument, code: string, x: number, y: number, ctx: RenderContext): void {
  const { layout, options } = ctx
  const box = layout.text
  const left = x + box.x
  const gap = mm(GAP_MM)
  let cursor = y + box.y + layout.blockTop

  doc.save().fillColor(COLORS.panel)

  for (const cover of ART_RULE_COVERS) {
    const rect = scaleBox(cover, layout.cardW, layout.cardH)

    doc.rect(x + rect.x, y + rect.y, rect.w, rect.h)
  }

  doc.fill().restore()

  doc
    .font(FONT_DISPLAY)
    .fontSize(layout.mainSize)
    .fillColor(COLORS.main)
    .text(options.text.main, left, cursor, textOptions(FONT_DISPLAY, layout.mainSize, box.w))

  cursor += layout.mainH + gap

  doc
    .font(FONT_BODY)
    .fontSize(layout.subSize)
    .fillColor(COLORS.sub)
    .text(options.text.sub, left, cursor, textOptions(FONT_BODY, layout.subSize, box.w))

  if (!options.showCode) return

  cursor += layout.subH + gap

  doc
    .font(FONT_BODY)
    .fontSize(layout.codeSize)
    .fillColor(COLORS.code)
    .text(code, left, cursor, { width: box.w, align: 'center', characterSpacing: 0.2 })
}

/** Stand-in card so the layout proofs before the artwork exists. */
function drawPlaceholderCard(doc: PDFKit.PDFDocument, x: number, y: number, layout: Layout): void {
  doc.save().rect(x, y, layout.cardW, layout.cardH).fill('#F2F3F5')
  doc.lineWidth(0.5).strokeColor(COLORS.placeholder).dash(2, { space: 2 })
  doc.rect(x + layout.text.x, y + layout.text.y, layout.text.w, layout.text.h).stroke()
  doc.rect(x + layout.qr.x, y + layout.qr.y, layout.qr.w, layout.qr.h).stroke()
  doc.undash().restore()
}

/**
 * Draw the QR as vector rectangles rather than an embedded bitmap: it stays
 * crisp at any print resolution and adds no image per card. Horizontal runs
 * of dark modules merge into one rectangle to keep the page small.
 *
 * The artwork's placeholder brackets are covered first — they sit too close to
 * the code to double as a quiet zone.
 */
function drawQr(doc: PDFKit.PDFDocument, code: string, x: number, y: number, ctx: RenderContext): void {
  const { layout, options } = ctx
  const box = layout.qr
  const { modules } = QRCode.create(claimUrl(options.baseUrl, code), {
    errorCorrectionLevel: options.errorCorrection,
  })
  const count = modules.size
  const side = Math.min(box.w, box.h)
  const moduleSize = side / (count + 2 * QR_QUIET_ZONE)
  const left = x + box.x + (box.w - side) / 2 + QR_QUIET_ZONE * moduleSize
  const top = y + box.y + (box.h - side) / 2 + QR_QUIET_ZONE * moduleSize

  doc
    .save()
    .roundedRect(x + box.x, y + box.y, box.w, box.h, layout.cardW * QR_BOX_RADIUS)
    .fill(COLORS.panel)
    .restore()

  doc.save().fillColor(COLORS.qrDark)

  for (let row = 0; row < count; row++) {
    let runStart = -1

    for (let col = 0; col <= count; col++) {
      const dark = col < count && modules.data[row * count + col] === 1

      if (dark && runStart === -1) runStart = col

      if (!dark && runStart !== -1) {
        const width = (col - runStart) * moduleSize

        doc.rect(left + runStart * moduleSize, top + row * moduleSize, width, moduleSize)
        runStart = -1
      }
    }
  }

  doc.fill().restore()
}

/**
 * Largest coherent type sizes whose stacked block fits the panel.
 *
 * The three sizes move together — headline, submessage at SUB_RATIO of it, the
 * code one point below that — so the card keeps its proportions whatever text
 * it is given; the search stops at the first size that fits.
 */
function fitBlock(doc: PDFKit.PDFDocument, options: Options, box: Box): BlockMetrics {
  const gap = mm(GAP_MM)
  let smallest: BlockMetrics | null = null

  for (let mainSize = MAIN_MAX_PT; mainSize >= MAIN_MIN_PT; mainSize -= 0.25) {
    const subSize = Math.max(mainSize * SUB_RATIO, SUB_MIN_PT)
    const codeSize = options.showCode ? Math.max(subSize - 1, CODE_MIN_PT) : 0
    const mainH = measure(doc, FONT_DISPLAY, mainSize, options.text.main, box.w)
    const subH = measure(doc, FONT_BODY, subSize, options.text.sub, box.w)
    const codeH = options.showCode ? measure(doc, FONT_BODY, codeSize, 'Xg', box.w) : 0
    const blockH = mainH + gap + subH + (options.showCode ? gap + codeH : 0)

    smallest = { mainSize, mainH, subSize, subH, codeSize, codeH, blockH }

    if (blockH <= box.h) return smallest
  }

  if (!smallest) throw new Error('type size search produced nothing; check MAIN_MAX_PT/MAIN_MIN_PT')

  return smallest
}

/** Height / width of the artwork, so cards keep its proportions. */
function imageAspect(doc: PDFKit.PDFDocument, imagePath: string | null): number {
  if (!imagePath) return 1

  const image = (doc as WithOpenImage).openImage(imagePath)

  return image.height / image.width
}

function integer(raw: string | undefined, def: number, min: number, max: number): number {
  const value = Math.floor(Number(raw ?? def))

  return Number.isFinite(value) ? Math.min(Math.max(value, min), max) : def
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2))
  const codes = readCodes(options.codesFile, options.limit)

  if (codes.length === 0) throw new Error(`no codes found in ${options.codesFile}`)

  const perPage = options.cols * options.rows

  console.error(
    `[claims:pdf] ${codes.length} code(s) → ${Math.ceil(codes.length / perPage)} page(s) of ${perPage} ` +
      `(${options.pageSize}) → ${options.out}`,
  )

  await renderPdf(codes, options)

  console.error(`[claims:pdf] wrote ${options.out}`)
}

function measure(doc: PDFKit.PDFDocument, font: string, size: number, text: string, width: number): number {
  return doc
    .font(font)
    .fontSize(size)
    .heightOfString(text, textOptions(font, size, width))
}

function mm(value: number): number {
  return (value * 72) / 25.4
}

function number(raw: string | undefined, def: number): number {
  const value = Number(raw ?? def)

  return Number.isFinite(value) && value >= 0 ? value : def
}

/** `x,y,w,h` as fractions of the card, e.g. `0.11,0.72,0.44,0.21`. */
function parseBox(raw: string | undefined, def: Box): Box {
  if (!raw) return def

  const parts = raw.split(',').map((part) => Number(part.trim()))
  const [x, y, w, h] = parts

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part)) || x === undefined) {
    throw new Error(`box must be four numbers "x,y,w,h" as card fractions, got "${raw}"`)
  }
  if (y === undefined || w === undefined || h === undefined) throw new Error(`incomplete box "${raw}"`)

  return { x, y, w, h }
}

function parseEcc(raw: string | undefined): Options['errorCorrection'] {
  const upper = raw?.toUpperCase()

  return upper === 'L' || upper === 'Q' || upper === 'H' ? upper : 'M'
}

/** `--name value` and valueless `--flag` pairs, last one wins. */
function parseFlags(argv: string[]): Map<string, string> {
  const flags = new Map<string, string>()

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]

    if (!token?.startsWith('--')) continue

    const next = argv[i + 1]

    if (next === undefined || next.startsWith('--')) {
      flags.set(token.slice(2), 'true')
    } else {
      flags.set(token.slice(2), next)
      i++
    }
  }

  return flags
}

function parseOptions(argv: string[]): Options {
  const flags = parseFlags(argv)

  if (flags.has('help')) {
    printHelp()
    process.exit(0)
  }

  return {
    ...parsePaths(flags),
    cols: integer(flags.get('cols'), 3, 1, 8),
    rows: integer(flags.get('rows'), 4, 1, 10),
    pageSize: flags.get('page')?.toUpperCase() === 'LETTER' ? 'LETTER' : 'A4',
    marginMm: number(flags.get('margin'), 8),
    baseUrl: (flags.get('base-url') ?? process.env.APP_BASE_URL ?? 'https://swap.cow.fi').replace(/\/+$/, ''),
    text: {
      main: flags.get('main-text') ?? 'You are our perfect match!',
      sub: flags.get('sub-text') ?? 'Be part of our Solana launch, graffiti CoW Swap for everyone to see!',
    },
    textBox: parseBox(flags.get('text-box'), ART_TEXT_BOX),
    qrBox: parseBox(flags.get('qr-box'), ART_QR_BOX),
    guides: flags.get('no-guides') !== 'true',
    showCode: flags.get('no-code-text') !== 'true',
    limit: flags.has('limit') ? integer(flags.get('limit'), 12, 1, 100_000) : null,
    errorCorrection: parseEcc(flags.get('ecc')),
  }
}

function parsePaths(
  flags: Map<string, string>,
): Pick<Options, 'codesFile' | 'out' | 'imagePath' | 'fontDisplay' | 'fontBody'> {
  const image = flags.get('image') ?? path.join('assets', 'cows-in-love.png')
  const display = flags.get('font-display')
  const body = flags.get('font-body')

  return {
    codesFile: resolvePath(flags.get('codes') ?? path.join('data', 'codes.txt')),
    out: resolvePath(flags.get('out') ?? path.join('data', 'claim-cards.pdf')),
    imagePath: image === 'none' ? null : resolvePath(image),
    fontDisplay: display ? resolvePath(display) : null,
    fontBody: body ? resolvePath(body) : null,
  }
}

function printHelp(): void {
  console.log(`
Render claim codes as a print-ready PDF of cut-out cards.

  --codes <file>       codes, one per line or the admin JSON (data/codes.txt)
  --out <file>         output PDF                     (data/claim-cards.pdf)
  --image <file>       card artwork, PNG or JPEG   (assets/cows-in-love.png)
                       "none" prints the layout as a proof instead
  --base-url <url>     app origin the QR points at   (https://swap.cow.fi)
  --main-text <s>      headline
  --sub-text <s>       smaller line under it
  --cols <n>           cards per row                                    (3)
  --rows <n>           rows per page                                    (4)
  --page <A4|LETTER>   paper size                                      (A4)
  --margin <mm>        smallest paper margin                            (8)
  --text-box x,y,w,h   message panel, as card fractions
  --qr-box x,y,w,h     QR panel, as card fractions
  --ecc <L|M|Q|H>      QR error correction                              (M)
  --limit <n>          render only the first n codes (test prints)
  --font-display <ttf> headline font        --font-body <ttf>
  --no-guides          omit the crop marks
  --no-code-text       omit the printed code under the message
`)
}

/**
 * Codes from a file: either one per line (what `claims:gen` prints) or the
 * JSON the admin endpoint returns — `{codes:[{code, amount}]}` or a bare array.
 */
function readCodes(file: string, limit: number | null): string[] {
  if (!fs.existsSync(file)) throw new Error(`codes file not found: ${file}`)

  const raw = fs.readFileSync(file, 'utf8').trim()
  const codes = raw.startsWith('{') || raw.startsWith('[') ? codesFromJson(raw) : raw.split(/\r?\n/)
  const cleaned = codes.map((code) => code.trim()).filter((code) => code.length > 0 && !code.startsWith('#'))
  const unique = [...new Set(cleaned)]

  if (unique.length !== cleaned.length) {
    console.error(`[claims:pdf] warning: dropped ${cleaned.length - unique.length} duplicate code(s)`)
  }

  return limit === null ? unique : unique.slice(0, limit)
}

function registerFonts(doc: PDFKit.PDFDocument, options: Options): void {
  const display = options.fontDisplay ?? (fs.existsSync(BUNDLED_DISPLAY) ? BUNDLED_DISPLAY : 'Helvetica-Bold')
  const body = options.fontBody ?? (fs.existsSync(BUNDLED_BODY) ? BUNDLED_BODY : 'Helvetica')

  doc.registerFont(FONT_DISPLAY, display)
  doc.registerFont(FONT_BODY, body)
}

async function renderPdf(codes: string[], options: Options): Promise<void> {
  validateImage(options.imagePath)
  fs.mkdirSync(path.dirname(options.out), { recursive: true })

  const doc = new PDFDocument({ size: options.pageSize, margin: 0, autoFirstPage: false })
  const stream = fs.createWriteStream(options.out)
  const done = new Promise<void>((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })

  doc.pipe(stream)
  registerFonts(doc, options)
  doc.info.Title = 'Graffiti Wall — claim cards'

  const layout = computeLayout(doc, options, imageAspect(doc, options.imagePath))
  const ctx: RenderContext = { layout, options }
  const perPage = options.cols * options.rows

  reportQrSize(codes, options, layout)

  for (const [index, code] of codes.entries()) {
    const slot = index % perPage

    if (slot === 0) {
      doc.addPage({ size: options.pageSize, margin: 0 })

      if (options.guides) drawCropMarks(doc, options, layout)
    }

    const x = layout.originX + (slot % options.cols) * layout.cardW
    const y = layout.originY + Math.floor(slot / options.cols) * layout.cardH

    drawCard(doc, code, x, y, ctx)

    if ((index + 1) % (perPage * 10) === 0) console.error(`[claims:pdf] ${index + 1}/${codes.length} cards`)
  }

  doc.end()
  await done
}

/**
 * Print the module size the QR will have on paper. Scanning a small code is
 * decided by this number, not by print resolution, so it is worth seeing
 * before 84 pages come off the printer.
 */
function reportQrSize(codes: string[], options: Options, layout: Layout): void {
  const first = codes[0]

  if (first === undefined) return

  const { modules } = QRCode.create(claimUrl(options.baseUrl, first), {
    errorCorrectionLevel: options.errorCorrection,
  })
  const side = Math.min(layout.qr.w, layout.qr.h)
  const moduleMm = ((side / (modules.size + 2 * QR_QUIET_ZONE)) * 25.4) / 72

  console.error(
    `[claims:pdf] card ${((layout.cardW * 25.4) / 72).toFixed(1)}mm, ` +
      `QR ${((side * 25.4) / 72).toFixed(1)}mm at ${modules.size} modules (ecc ${options.errorCorrection}) ` +
      `→ ${moduleMm.toFixed(2)}mm per module`,
  )

  if (moduleMm < MIN_MODULE_MM) {
    console.error(
      `[claims:pdf] warning: modules under ${MIN_MODULE_MM}mm scan poorly. ` +
        `Use --ecc L, a shorter --base-url, or fewer cards per page.`,
    )
  }
}

function resolvePath(target: string): string {
  return path.isAbsolute(target) ? target : path.resolve(PKG_ROOT, target)
}

/** A box given in card fractions, in points. */
function scaleBox(box: Box, cardW: number, cardH: number): Box {
  return { x: box.x * cardW, y: box.y * cardH, w: box.w * cardW, h: box.h * cardH }
}

/** Shared so a line is measured exactly as it is later drawn. */
function textOptions(font: string, size: number, width: number): PDFKit.Mixins.TextOptions {
  return { width, align: 'center', lineGap: font === FONT_DISPLAY ? size * DISPLAY_LINE_GAP : 0 }
}

function validateImage(imagePath: string | null): void {
  if (!imagePath) return

  if (!fs.existsSync(imagePath)) throw new Error(`image not found: ${imagePath}`)

  if (!/\.(png|jpe?g)$/i.test(imagePath)) {
    throw new Error(`image must be PNG or JPEG (got ${path.extname(imagePath)}); convert it first`)
  }
}
