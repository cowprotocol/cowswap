const LISTBOX_OFFSET_PX = 4
const VIEWPORT_MARGIN_PX = 8

export interface ListboxPosition {
  top: number
  left: number
  minWidth: number
}

interface Box {
  top: number
  bottom: number
  left: number
  width: number
}

/** Below the trigger, above it when it doesn't fit below and fits above, and kept inside the viewport horizontally */
export function getListboxPosition(
  trigger: Box,
  listbox: { width: number; height: number },
  viewport: { width: number; height: number },
): ListboxPosition {
  const below = trigger.bottom + LISTBOX_OFFSET_PX
  const above = trigger.top - listbox.height - LISTBOX_OFFSET_PX
  const fitsBelow = below + listbox.height <= viewport.height - VIEWPORT_MARGIN_PX
  const width = Math.max(listbox.width, trigger.width)

  return {
    top: fitsBelow || above < VIEWPORT_MARGIN_PX ? below : above,
    left: Math.max(VIEWPORT_MARGIN_PX, Math.min(trigger.left, viewport.width - width - VIEWPORT_MARGIN_PX)),
    minWidth: trigger.width,
  }
}
