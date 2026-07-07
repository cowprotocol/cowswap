import type { PresetOption } from '../../ui/inputs/PresetsButtons/PresetsButtons.component'
import type * as CSS from 'csstype'

export type OnStyleJsonChange = (value: string | null) => void

export const RESPONSIVE_BLOCK_ROOT_STYLE: CSS.Properties = {
  width: '100%',
  height: 'var(--dynamicHeight)',
}

export const DEFAULT_ROOT_STYLE_JSON = JSON.stringify(RESPONSIVE_BLOCK_ROOT_STYLE, null, 2)

export const APPEARANCE_STYLE_PRESET_OPTIONS = [
  {
    label: 'Responsive block (default)',
    value: 'responsive-block',
  },
  {
    label: 'Full-screen',
    value: 'full-screen',
  },
  {
    label: 'Bottom right popup',
    value: 'bottom-right-popup',
  },
  {
    label: 'Right sidebar',
    value: 'right-sidebar',
  },
  {
    label: 'Modal',
    value: 'modal',
  },
  {
    label: 'Debug',
    value: 'debug',
  },
  {
    label: 'None',
    value: 'none',
  },
] as const satisfies PresetOption[]

export type AppearanceStylePresetKey = (typeof APPEARANCE_STYLE_PRESET_OPTIONS)[number]['value']

type PresetElement = 'root' | 'bodyWrapper' | 'card'

// eslint-disable-next-line max-lines-per-function
export function getAppearanceStylePresets(
  paperBackgroundColor: string,
): Record<AppearanceStylePresetKey, Partial<Record<PresetElement, CSS.Properties>>> {
  return {
    none: {},
    'responsive-block': {
      root: RESPONSIVE_BLOCK_ROOT_STYLE,
    },
    'full-screen': {
      root: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: paperBackgroundColor,
      },
    },
    'bottom-right-popup': {
      root: {
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        boxShadow: '0 0 32px 0 black',
        borderRadius: '8px',
        width: '420px',
        maxHeight: 'calc(100lvh - 48px)',
        height: 'var(--dynamicHeight)',
        backgroundColor: paperBackgroundColor,
      },
      bodyWrapper: {
        padding: '0',
      },
      card: {
        borderRadius: '0',
      },
    },
    'right-sidebar': {
      root: {
        position: 'absolute',
        top: '0',
        bottom: '0',
        right: '0',
        boxShadow: '0 0 32px 0 black',
        borderRadius: '0',
        width: '420px',
        height: '100dvh',
        backgroundColor: paperBackgroundColor,
      },
      bodyWrapper: {
        padding: '0',
      },
      card: {
        borderRadius: '0',
      },
    },
    modal: {
      root: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 32px 0 black',
        borderRadius: '8px',
        width: '800px',
        height: '600px',
        minWidth: '75%',
        maxWidth: 'calc(100% - 32px)',
        maxHeight: 'calc(100% - 32px)',
        backgroundColor: paperBackgroundColor,
      },
      bodyWrapper: {
        padding: '0',
      },
      card: {
        borderRadius: '0',
      },
    },
    debug: {
      root: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'red',
      },
      bodyWrapper: {
        backgroundColor: 'cyan',
      },
      card: {
        backgroundColor: 'yellow',
      },
    },
  }
}

export function applyPresetStyle(onStyleJsonChange: OnStyleJsonChange, style: CSS.Properties | undefined): void {
  if (style) {
    onStyleJsonChange(JSON.stringify(style, null, 2))
    return
  }

  onStyleJsonChange(null)
}
