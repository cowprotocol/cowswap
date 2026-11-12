export function validateLocalSvgUrls(value: string): void {
  for (const match of value.matchAll(/url\s*\(([^)]*)\)/gi)) {
    const target = match[1].trim().replace(/^['"]|['"]$/g, '')
    if (!target.startsWith('#')) throw new Error('Remove external resources from the SVG before uploading.')
  }
}
