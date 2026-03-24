import type { KeyboardEvent as ReactKeyboardEvent, SyntheticEvent } from 'react'

/** After last typeahead key, filter text clears; active option index is unchanged. */
export const SELECT_FILTER_RESET_MS = 2800

/**
 * Keeps focus on the trigger while interacting with the portaled listbox so blur
 * does not close the menu before `click` runs on an option.
 */
export function preventAnchorBlur(event: SyntheticEvent): void {
  event.preventDefault()
}

export function isPrintableTypeaheadKey(e: KeyboardEvent | ReactKeyboardEvent<HTMLButtonElement>): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
}

export function labelMatchesFilter(label: string, query: string): boolean {
  if (!query) return true
  return label.toLowerCase().includes(query.toLowerCase())
}
