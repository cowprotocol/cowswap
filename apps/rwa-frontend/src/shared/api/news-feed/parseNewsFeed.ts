export interface NewsFeedItem {
  title: string
  /** `https` */
  url: string
  /** ISO 8601 */
  publishedAt: string | null
}

const RSS_ITEM_REGEX = /<item\b[^>]*>([\s\S]*?)<\/item>/gi
const ATOM_ENTRY_REGEX = /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi
const ATOM_LINK_REGEX = /<link\b([^>]*?)\/?>/gi
const DATE_TAGS = ['pubDate', 'published', 'updated', 'dc:date']

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

/** Items of an RSS 2.0 or Atom feed in document order, without the ones lacking a title or an `https` link */
export function parseNewsFeed(xml: string): NewsFeedItem[] {
  const isAtom = !/<item\b/i.test(xml)
  const blocks = [...xml.matchAll(isAtom ? ATOM_ENTRY_REGEX : RSS_ITEM_REGEX)].map((match) => match[1])

  return blocks.flatMap((block) => {
    const title = readText(block, 'title')
    const url = toHttpsUrl(isAtom ? readAtomLink(block) : readText(block, 'link'))

    if (!title || !url) return []

    return [{ title, url, publishedAt: readDate(block) }]
  })
}

function decodeEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] !== '#') return NAMED_ENTITIES[code.toLowerCase()] ?? entity

    const codePoint = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)

    return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity
  })
}

/** `rel="alternate"` or no `rel` is the article page; `self`, `enclosure` and others are not */
function readAtomLink(block: string): string | null {
  for (const [, attributes] of block.matchAll(ATOM_LINK_REGEX)) {
    const rel = readAttribute(attributes, 'rel')
    const href = readAttribute(attributes, 'href')

    if (href && (!rel || rel === 'alternate')) return href
  }

  return null
}

function readAttribute(attributes: string, name: string): string | null {
  const match = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i').exec(attributes)

  return match ? decodeEntities(match[2]) : null
}

function readDate(block: string): string | null {
  for (const tag of DATE_TAGS) {
    const value = readText(block, tag)
    const time = value ? Date.parse(value) : NaN

    if (!Number.isNaN(time)) return new Date(time).toISOString()
  }

  return null
}

function readText(block: string, tag: string): string | null {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(block)

  if (!match) return null

  const text = unwrapCdata(match[1])
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text ? decodeEntities(text) : null
}

function toHttpsUrl(value: string | null): string | null {
  if (!value || !URL.canParse(value)) return null

  const url = new URL(value)

  return url.protocol === 'https:' ? url.href : null
}

function unwrapCdata(value: string): string {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
}
