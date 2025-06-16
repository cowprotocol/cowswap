import { OrderProgressBarProps } from '../types'

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

// Step-specific height overrides (if needed)
type StepHeightConfig = Partial<Record<NonNullable<OrderProgressBarProps['stepName']>, number>>

export const STEP_HEIGHT_OVERRIDES: StepHeightConfig = {
  // All steps use consistent height to prevent shifts
  // Override only if absolutely necessary
} as const

/**
 * Calculate the total container height based on visible steps
 */
export function calculateContainerHeight(currentStep: number, totalSteps: number, isMobile: boolean): number {
  const heights = isMobile ? STEP_HEIGHTS.mobile : STEP_HEIGHTS.desktop

  // Always show current step + next step (for smooth transitions)
  const visibleSteps = currentStep === totalSteps - 1 ? 1 : 2
  const totalHeight = heights.stepContent * visibleSteps

  return Math.max(totalHeight, heights.minContainer)
}

/**
 * Get the height for a specific step's top section
 */
export function getStepTopSectionHeight(stepName: OrderProgressBarProps['stepName'], isMobile: boolean): number {
  const baseHeight = isMobile ? STEP_HEIGHTS.mobile.topSection : STEP_HEIGHTS.desktop.topSection
  if (!stepName) return baseHeight
  return STEP_HEIGHT_OVERRIDES[stepName] || baseHeight
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
