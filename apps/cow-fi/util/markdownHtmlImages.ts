interface AllowedHtmlImage {
  src: string
  alt: string
}

interface MarkdownAstNode {
  type?: unknown
  value?: unknown
  children?: unknown[]
}

const HTML_ATTRIBUTE_REGEXP = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g
const ASCII_CONTROL_CHARACTERS_REGEXP = /[\u0000-\u001f\u007f]/
const URL_SCHEME_REGEXP = /^[a-z][a-z0-9+.-]*:/i

const HTML_ENTITIES = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
} as const

export function remarkAllowedHtmlImages(): (tree: unknown) => void {
  return transformAllowedHtmlImages
}

export function getAllowedHtmlImage(html: string): AllowedHtmlImage | null {
  const imageTag = getSingleImageTag(html)
  if (!imageTag) return null

  const attributes = getHtmlAttributes(imageTag)
  const rawSrc = attributes.get('data-src') ?? attributes.get('src')
  if (!rawSrc) return null

  const src = decodeHtmlAttribute(rawSrc).trim()
  if (!isSafeImageSrc(src)) return null

  return {
    src,
    alt: decodeHtmlAttribute(attributes.get('alt') ?? ''),
  }
}

function transformAllowedHtmlImages(node: unknown): void {
  if (!isMarkdownAstNode(node) || !Array.isArray(node.children)) return

  node.children = node.children.map((child) => {
    if (isHtmlNode(child)) {
      const image = getAllowedHtmlImage(child.value)
      if (image) {
        return {
          type: 'image',
          url: image.src,
          alt: image.alt,
          title: null,
        }
      }
    }

    transformAllowedHtmlImages(child)
    return child
  })
}

function getSingleImageTag(html: string): string | null {
  const trimmedHtml = html.trim()
  if (!/^<img\b/i.test(trimmedHtml)) return null

  const tagEnd = getTagEndIndex(trimmedHtml)
  if (tagEnd === -1) return null

  const trailingHtml = trimmedHtml.slice(tagEnd + 1).trim()
  return trailingHtml ? null : trimmedHtml.slice(0, tagEnd + 1)
}

function getTagEndIndex(html: string): number {
  let quote: '"' | "'" | null = null

  for (let index = 0; index < html.length; index++) {
    const character = html[index]

    if (quote) {
      if (character === quote) quote = null
    } else if (character === '"' || character === "'") {
      quote = character
    } else if (character === '>') {
      return index
    }
  }

  return -1
}

function getHtmlAttributes(imageTag: string): Map<string, string> {
  const attributes = new Map<string, string>()
  HTML_ATTRIBUTE_REGEXP.lastIndex = 0

  let match = HTML_ATTRIBUTE_REGEXP.exec(imageTag)
  while (match) {
    const name = match[1]
    if (name) {
      attributes.set(name.toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '')
    }

    match = HTML_ATTRIBUTE_REGEXP.exec(imageTag)
  }

  return attributes
}

function isSafeImageSrc(src: string): boolean {
  if (!src) return false
  if (ASCII_CONTROL_CHARACTERS_REGEXP.test(src)) return false
  if (!URL_SCHEME_REGEXP.test(src)) return true

  try {
    const parsedUrl = new URL(src)
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'
  } catch {
    return false
  }
}

function decodeHtmlAttribute(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (match, entity: string) => {
    const normalizedEntity = entity.toLowerCase()
    const namedEntity = HTML_ENTITIES[normalizedEntity as keyof typeof HTML_ENTITIES]
    if (namedEntity) return namedEntity

    const radix = normalizedEntity.startsWith('#x') ? 16 : 10
    const numericValue = Number.parseInt(normalizedEntity.replace(/^#x?/i, ''), radix)
    if (!Number.isFinite(numericValue)) return match

    try {
      return String.fromCodePoint(numericValue)
    } catch {
      return match
    }
  })
}

function isMarkdownAstNode(node: unknown): node is MarkdownAstNode {
  return typeof node === 'object' && node !== null
}

function isHtmlNode(node: unknown): node is { type: 'html'; value: string } {
  return isMarkdownAstNode(node) && node.type === 'html' && typeof node.value === 'string'
}
