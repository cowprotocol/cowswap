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
const HTML_COMMENT_REGEXP = /<!--[\s\S]*?-->/g
const ASCII_CONTROL_CHARACTERS_REGEXP = /[\u0000-\u001f\u007f]/
const URL_SCHEME_REGEXP = /^[a-z][a-z0-9+.-]*:/i
const ALLOWED_IMAGE_CONTAINER_TAGS = new Set([
  'a',
  'br',
  'div',
  'figcaption',
  'figure',
  'img',
  'p',
  'picture',
  'source',
  'span',
])

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
  return getAllowedHtmlImages(html)[0] ?? null
}

export function getAllowedHtmlImages(html: string): AllowedHtmlImage[] {
  const normalizedHtml = removeHtmlComments(html)
  if (!hasOnlyAllowedImageMarkup(normalizedHtml)) return []

  return getImageTags(normalizedHtml).reduce<AllowedHtmlImage[]>((images, imageTag) => {
    const image = getImageFromTag(imageTag)
    if (image) images.push(image)
    return images
  }, [])
}

function getImageFromTag(imageTag: string): AllowedHtmlImage | null {
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

  node.children = node.children.flatMap((child) => {
    if (isHtmlNode(child)) {
      const images = getAllowedHtmlImages(child.value)
      if (images.length > 0) {
        return images.map((image) => ({
          type: 'image',
          url: image.src,
          alt: image.alt,
          title: null,
        }))
      }
    }

    transformAllowedHtmlImages(child)
    return child
  })
}

function hasOnlyAllowedImageMarkup(html: string): boolean {
  const tags = getHtmlTags(html)
  return tags.length > 0 && tags.every(({ name }) => ALLOWED_IMAGE_CONTAINER_TAGS.has(name))
}

function getImageTags(html: string): string[] {
  return getHtmlTags(html)
    .filter(({ name }) => name === 'img')
    .map(({ tag }) => tag)
}

function getHtmlTags(html: string): Array<{ tag: string; name: string }> {
  const tags: Array<{ tag: string; name: string }> = []
  let searchIndex = 0

  while (searchIndex < html.length) {
    const tagStart = html.indexOf('<', searchIndex)
    if (tagStart === -1) break

    const tagEnd = getTagEndIndex(html, tagStart)
    if (tagEnd === -1) break

    const tag = html.slice(tagStart, tagEnd + 1)
    const tagNameMatch = tag.match(/^<\/?\s*([a-z][\w:-]*)\b/i)
    if (tagNameMatch?.[1]) tags.push({ tag, name: tagNameMatch[1].toLowerCase() })

    searchIndex = tagEnd + 1
  }

  return tags
}

function getTagEndIndex(html: string, tagStart: number): number {
  let quote: '"' | "'" | null = null

  for (let index = tagStart; index < html.length; index++) {
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

function removeHtmlComments(html: string): string {
  return html.replace(HTML_COMMENT_REGEXP, '')
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
