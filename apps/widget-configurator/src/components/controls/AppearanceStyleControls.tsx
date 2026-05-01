import { useMemo, type ReactNode } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { jsonHelperText } from '../../utils/jsonFieldParsing'
import { JsonInput } from '../ui/controls/JsonInput/JsonInput.component'
import { PresetOption, PresetsButtons } from '../ui/controls/PresetsButtons/PresetsButtons.component'

import type { JsonState, OnJsonStateChange } from '../../hooks/useJsonState'
import type * as CSS from 'csstype'

const presetsOptions = [
  {
    label: 'None',
    value: 'none',
  },
  {
    label: 'Responsive block',
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
] as const satisfies PresetOption[]

type PresetKey = (typeof presetsOptions)[number]['value']

type PresetElement = 'iframe' | 'appWrapper' | 'bodyWrapper' | 'card'

function getPresets(paperBackgroundColor: string): Record<PresetKey, Partial<Record<PresetElement, CSS.Properties>>> {
  return {
    none: {},
    'responsive-block': {
      iframe: {
        width: '100%',
        height: 'var(--dynamicHeight)',
      },
    },
    'full-screen': {
      iframe: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      },
    },
    'bottom-right-popup': {
      iframe: {
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
      iframe: {
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
      iframe: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 32px 0 black',
        borderRadius: '8px',
        width: '800px',
        height: '600px',
        minWidth: '75%',
        minHeight: 'var(--dynamicHeight)',
        maxWidth: '100%',
        maxHeight: '100%',
        backgroundColor: paperBackgroundColor,
      },
      bodyWrapper: {
        padding: '0',
      },
      card: {
        borderRadius: '0',
      },
    },
  }
}

function applyPresetStyle(onJsonStateChange: OnJsonStateChange, style: CSS.Properties | undefined): void {
  if (style) {
    onJsonStateChange(JSON.stringify(style, null, 2))
    return
  }

  onJsonStateChange(null)
}

export interface AppearanceStyleControlsProps {
  paperBackgroundColor: string
  iframeStyleJson: JsonState<CSS.Properties>
  onIframeStyleJson: OnJsonStateChange
  appWrapperStyleJson: JsonState<CSS.Properties>
  onAppWrapperStyleJson: OnJsonStateChange
  bodyWrapperStyleJson: JsonState<CSS.Properties>
  onBodyWrapperStyleJson: OnJsonStateChange
  cardStyleJson: JsonState<CSS.Properties>
  onCardStyleJson: OnJsonStateChange
}

export function AppearanceStyleControls({
  paperBackgroundColor,
  iframeStyleJson,
  onIframeStyleJson,
  appWrapperStyleJson,
  onAppWrapperStyleJson,
  bodyWrapperStyleJson,
  onBodyWrapperStyleJson,
  cardStyleJson,
  onCardStyleJson,
}: AppearanceStyleControlsProps): ReactNode {
  const presets = useMemo(() => getPresets(paperBackgroundColor), [paperBackgroundColor])

  const handleIframeJsonChange = (_name: string, value: string | null): void => {
    onIframeStyleJson(value)
  }
  const handleBodyWrapperJsonChange = (_name: string, value: string | null): void => {
    onBodyWrapperStyleJson(value)
  }
  const handleAppWrapperJsonChange = (_name: string, value: string | null): void => {
    onAppWrapperStyleJson(value)
  }
  const handleCardJsonChange = (_name: string, value: string | null): void => {
    onCardStyleJson(value)
  }

  const handlePresetClick = (value: string): void => {
    const preset = presets[value as PresetKey]

    applyPresetStyle(onIframeStyleJson, preset?.iframe)
    applyPresetStyle(onAppWrapperStyleJson, preset?.appWrapper)
    applyPresetStyle(onBodyWrapperStyleJson, preset?.bodyWrapper)
    applyPresetStyle(onCardStyleJson, preset?.card)
  }

  return (
    <Stack spacing={2.4}>
      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          Presets
        </Typography>
        <PresetsButtons presets={presetsOptions} onPresetClick={handlePresetClick} />
      </Box>
      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          Iframe (host)
        </Typography>
        <JsonInput
          label="Iframe styles (JSON)"
          name="iframe.style"
          value={iframeStyleJson.rawJsonValue}
          onChange={handleIframeJsonChange}
          error={iframeStyleJson.error}
          helperText={jsonHelperText(iframeStyleJson.error)}
        />
      </Box>

      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          #appWrapper (inside iframe)
        </Typography>
        <JsonInput
          label="App wrapper styles (JSON)"
          name="appWrapper.style"
          value={appWrapperStyleJson.rawJsonValue}
          onChange={handleAppWrapperJsonChange}
          error={appWrapperStyleJson.error}
          helperText={jsonHelperText(appWrapperStyleJson.error)}
        />
      </Box>

      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          #bodyWrapper (inside iframe)
        </Typography>
        <JsonInput
          label="Body wrapper styles (JSON)"
          name="bodyWrapper.style"
          value={bodyWrapperStyleJson.rawJsonValue}
          onChange={handleBodyWrapperJsonChange}
          error={bodyWrapperStyleJson.error}
          helperText={jsonHelperText(bodyWrapperStyleJson.error)}
        />
      </Box>

      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          #card (inside iframe)
        </Typography>
        <JsonInput
          label="Card styles (JSON)"
          name="card.style"
          value={cardStyleJson.rawJsonValue}
          onChange={handleCardJsonChange}
          error={cardStyleJson.error}
          helperText={jsonHelperText(cardStyleJson.error)}
        />
      </Box>
    </Stack>
  )
}
