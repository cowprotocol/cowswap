const TOOLTIP_OFFSET_PX = 6
const VIEWPORT_MARGIN_PX = 8

export interface TooltipPosition {
  top: number
  left: number
}

interface Box {
  top: number
  bottom: number
  left: number
  width: number
}

/** Centered above the trigger, below it when there is no room above, and kept inside the viewport horizontally */
export function getTooltipPosition(
  trigger: Box,
  tooltip: { width: number; height: number },
  viewportWidth: number,
): TooltipPosition {
  const above = trigger.top - tooltip.height - TOOLTIP_OFFSET_PX
  const centered = trigger.left + (trigger.width - tooltip.width) / 2
  const maxLeft = viewportWidth - tooltip.width - VIEWPORT_MARGIN_PX

  return {
    top: above >= VIEWPORT_MARGIN_PX ? above : trigger.bottom + TOOLTIP_OFFSET_PX,
    left: Math.max(VIEWPORT_MARGIN_PX, Math.min(centered, maxLeft)),
  }
}
