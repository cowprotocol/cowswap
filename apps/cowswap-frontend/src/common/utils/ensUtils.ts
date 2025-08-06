/**
 * Checks if a value has an ENS name ending (.eth)
 * @param value The string to check
 * @returns true if the value ends with '.eth', false otherwise
 */
export function hasEnsEnding(value: string | undefined | null): boolean {
  return !!value && value.endsWith('.eth')
}