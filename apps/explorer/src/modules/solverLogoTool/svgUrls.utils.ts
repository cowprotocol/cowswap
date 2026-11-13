export function validateLocalSvgUrls(value: string): void {
  if (/[\\]|\/\*|\*\//.test(value))
    throw new Error('Use an SVG without escaped CSS or CSS comments. Export a simpler self-contained SVG.')
  for (const match of value.matchAll(/url\s*\(([^)]*)\)/gi)) {
    const target = match[1].trim().replace(/^['"]|['"]$/g, '')
    if (!target.startsWith('#')) throw new Error('Remove external resources from the SVG before uploading.')
  }
}
