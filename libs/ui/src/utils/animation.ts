import { UI } from '../enum'

// TODO: To be used later...
export function transition(properties: string[]): string {
  return properties
    .map((property) => `${property} var(${UI.ANIMATION_DURATION}) ${UI.ANIMATION_TIMING_FUNCTION}`)
    .join(', ')
}
