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
 * Calculate the total container height based on visible steps
 * @param currentStep - Zero-indexed current step (0 to totalSteps-1)
 * @param totalSteps - Total number of steps (must be > 0)
 * @param isMobile - Whether to use mobile layout dimensions
 * @returns Container height in pixels
 * @throws {Error} When parameters are invalid or would cause layout issues
 */
export function calculateContainerHeight(currentStep: number, totalSteps: number, isMobile: boolean): number {
  // Input validation with context for debugging
  if (!Number.isInteger(totalSteps) || totalSteps <= 0) {
    throw new Error(`calculateContainerHeight: totalSteps must be a positive integer, got ${totalSteps}`)
  }
  if (!Number.isInteger(currentStep) || currentStep < 0) {
    throw new Error(`calculateContainerHeight: currentStep must be a non-negative integer, got ${currentStep}`)
  }
  if (currentStep >= totalSteps) {
    throw new Error(`calculateContainerHeight: currentStep (${currentStep}) must be less than totalSteps (${totalSteps})`)
  }

  const heights = isMobile ? STEP_HEIGHTS.mobile : STEP_HEIGHTS.desktop

  // Always show current step + next step (for smooth transitions)
  const visibleSteps = currentStep === totalSteps - 1 ? 1 : 2
  const totalHeight = heights.stepContent * visibleSteps

  return Math.max(totalHeight, heights.minContainer)
}


/**
 * Calculate transform offset for smooth step transitions
 */
export function calculateTransformOffset(currentStep: number, stepHeight: number): number {
  return currentStep * stepHeight
}

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
