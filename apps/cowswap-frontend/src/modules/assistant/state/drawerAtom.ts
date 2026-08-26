import { atom } from 'jotai'

/**
 * Whether the assistant drawer is showing.
 *
 * Closed by default, deliberately: nothing about CoW Swap changes for anyone who
 * doesn't open it. An evaluation link can start it open with `?assistant=1` —
 * see useAssistantDrawer.
 */
export const assistantDrawerOpenAtom = atom(false)
