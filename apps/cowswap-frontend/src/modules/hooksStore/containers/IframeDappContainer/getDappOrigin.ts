export function getDappOrigin(url: string): string | null {
  try {
    const origin = new URL(url).origin

    return origin === 'null' ? null : origin
  } catch {
    return null
  }
}
