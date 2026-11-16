import brrrUrl from './assets/brrr.png'
import contextReferenceUrl from './assets/context-reference.png'
import svgDfusionSrc from './assets/dfusion.svg'
import fibrousUrl from './assets/fibrous.png'
import { LogoTransform, SampleKey } from './solverLogoTool.types'

export const SOLVER_LOGO_PATH = '/solver-logo-tool'
export const INITIAL_TRANSFORM: LogoTransform = { scale: 100, x: 0, y: 0, background: 'transparent' }
export const CONTEXT_REFERENCE_URL = contextReferenceUrl
export const SAMPLES: Record<SampleKey, { name: string; file: string; url: string }> = {
  fibrous: { name: 'Fibrous', file: 'fibrous.png', url: fibrousUrl },
  dfusion: { name: 'Dfusion', file: 'dfusion.svg', url: svgDfusionSrc },
  brrr: { name: 'BRRRolver', file: 'brrr.png', url: brrrUrl },
}
