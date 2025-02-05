export enum TransitionDuration {
  slow = 500,
  medium = 250,
  fast = 125,
}

export const transitions = {
  duration: {
    slow: `${TransitionDuration.slow}ms`,
    medium: `${TransitionDuration.medium}ms`,
    fast: `${TransitionDuration.fast}ms`,
  },
  timing: {
    ease: 'ease',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
} as const

export type Transitions = typeof transitions
