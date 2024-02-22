export interface ContentHeading {
  id: string
  title: string
  tag: string
}

export function deriveHeading(node: HTMLDivElement, tag: string): ContentHeading[] {
  return Array.from(node.getElementsByTagName(tag)).map<ContentHeading>((heading) => {
    const title = heading.textContent || ''

    return {
      id: headingToId(title),
      title: title,
      tag,
    }
  })
}

export function headingToId(content: string | null): string {
  if (!content) return ''
  return content.toLowerCase().replace(/[^a-zA-Z]/g, '')
}
