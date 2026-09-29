import { UI } from '../enum'

/**
 * Slow down ALL transitions for debugging purposes.
 */
const DEBUG_MODE = false

const DEBUG_TRANSITION_DURATION = '10s'

export interface TransitionConfig {
  duration?: string
  timingFunction?: string
  debug?: boolean
}

export function slowTransition(properties: string[], config?: TransitionConfig): string {
  return transition(properties, { duration: `var(${UI.ANIMATION_DURATION_SLOW})`, ...config })
}

/**
 * Generates a CSS transition property string for the given properties.
 *
 * // TODO: To be used later all around the project.
 *
 * @param properties - The CSS properties to transition.
 * @param config.duration - The duration of the transition.
 * @param config.timingFunction - The timing function of the transition.
 * @param config.debug - Whether to use the debug mode.
 *
 * @returns A CSS transition property string.
 */
export function transition(properties: string[], config?: TransitionConfig): string {
  const debug = config?.debug ?? DEBUG_MODE
  const duration = debug ? DEBUG_TRANSITION_DURATION : (config?.duration ?? `var(${UI.ANIMATION_DURATION})`)
  const timingFunction = config?.timingFunction ?? `var(${UI.ANIMATION_TIMING_FUNCTION})`

  return properties.map((property) => `${property} ${duration} ${timingFunction}`).join(', ')
}
