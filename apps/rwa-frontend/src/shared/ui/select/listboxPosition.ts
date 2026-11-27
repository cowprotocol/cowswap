const LISTBOX_OFFSET_PX = 4
const VIEWPORT_MARGIN_PX = 8

export interface ListboxPosition {
  top: number
  left: number
  minWidth: number
  /** The measured height, cut to the space on the chosen side so the listbox scrolls instead of leaving the viewport */
  maxHeight: number
}

interface Box {
  top: number
  bottom: number
  left: number
  width: number
}

/**
 * Below the trigger, above it when it fits only there, otherwise on the side with more space. Kept inside the viewport
 */
export function getListboxPosition(
  trigger: Box,
  listbox: { width: number; height: number },
  viewport: { width: number; height: number },
): ListboxPosition {
  const below = trigger.bottom + LISTBOX_OFFSET_PX
  const spaceBelow = viewport.height - VIEWPORT_MARGIN_PX - below
  const spaceAbove = trigger.top - LISTBOX_OFFSET_PX - VIEWPORT_MARGIN_PX
  const isBelow = listbox.height <= spaceBelow || (listbox.height > spaceAbove && spaceBelow >= spaceAbove)
  const maxHeight = Math.min(listbox.height, isBelow ? spaceBelow : spaceAbove)
  const width = Math.max(listbox.width, trigger.width)

  return {
    top: isBelow ? below : trigger.top - LISTBOX_OFFSET_PX - maxHeight,
    left: Math.max(VIEWPORT_MARGIN_PX, Math.min(trigger.left, viewport.width - width - VIEWPORT_MARGIN_PX)),
    minWidth: trigger.width,
    maxHeight,
  }
}
