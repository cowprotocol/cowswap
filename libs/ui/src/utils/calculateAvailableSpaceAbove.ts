/**
 * Calculates the available space above an element, useful for backdrop heights or overlay positioning
 * @param rect - The element's bounding client rect
 * @param gap - Gap distance from the element (default: 8px)
 * @returns CSS height string for the available space above the element
 */
export function calculateAvailableSpaceAbove(rect: DOMRect | null, gap: number = 8): string {
  if (!rect) return '100vh'

  const availableHeight = Math.max(0, rect.top - gap)
  return `${availableHeight}px`
}
