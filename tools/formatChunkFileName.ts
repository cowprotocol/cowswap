/** Rollup chunk shape; defined locally so this helper does not depend on `rollup` types. */
interface ChunkFacadeOnly {
  readonly facadeModuleId: string | null
}

export function formatChunkFileName(
  chunk: Pick<ChunkFacadeOnly, 'facadeModuleId'>,
  chunkGroups: Record<string, string>,
): string | undefined {
  if (!chunk.facadeModuleId) return undefined
  for (const key in chunkGroups) {
    if (chunk.facadeModuleId.includes(key)) {
      const splitted = chunk.facadeModuleId.split(key)
      const name = splitted[splitted.length - 1]
        .replace(/\/(index|dist|node_modules|browser)/g, '')
        .replace(/\.(tsx?|jsx?|mjs|mts|cjs)$/, '')
        .replace(/\//g, '-')

      return chunkGroups[key].replace(/\[name\]/g, name)
    }
  }
  return undefined
}
