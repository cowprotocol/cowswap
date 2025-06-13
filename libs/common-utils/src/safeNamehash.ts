import { namehash } from '@ethersproject/hash'

export function safeNamehash(name?: string): string | undefined {
  if (name === undefined) return undefined

  try {
    return namehash(name)
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.debug(error)
    return undefined
  }
}
