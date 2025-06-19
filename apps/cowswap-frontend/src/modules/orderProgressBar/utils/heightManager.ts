// Height constants for consistent layout
export const STEP_HEIGHTS = {
  // Desktop heights
  desktop: {
    topSection: 230,
    stepContent: 80,
    minContainer: 192,
  },
  // Mobile heights
  mobile: {
    topSection: 200,
    stepContent: 70,
    minContainer: 160,
  },
} as const

// Transition timing constants for synchronized animations
export const TRANSITION_TIMINGS = {
  height: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  all: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
} as const

/**
 * CSS custom properties for dynamic height management
 */
export function getHeightCSSVariables(isMobile: boolean): Record<string, string> {
  const heights = isMobile ? STEP_HEIGHTS.mobile : STEP_HEIGHTS.desktop

  return {
    '--progress-top-section-height': `${heights.topSection}px`,
    '--progress-step-content-height': `${heights.stepContent}px`,
    '--progress-min-container-height': `${heights.minContainer}px`,
    '--progress-transition-height': TRANSITION_TIMINGS.height,
    '--progress-transition-transform': TRANSITION_TIMINGS.transform,
    '--progress-transition-opacity': TRANSITION_TIMINGS.opacity,
    '--progress-transition-all': TRANSITION_TIMINGS.all,
  }
}
