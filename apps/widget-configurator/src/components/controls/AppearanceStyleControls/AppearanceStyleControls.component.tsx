import { useMemo, type ReactNode } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import {
  APPEARANCE_STYLE_PRESET_OPTIONS,
  applyPresetStyle,
  getAppearanceStylePresets,
  type AppearanceStylePresetKey,
} from './AppearanceStyleControls.utils'

import { useAsyncJsonError } from '../../../hooks/useAsyncJsonError'
import { JsonInput } from '../../ui/inputs/JsonInput/JsonInput.component'
import { PresetsButtons } from '../../ui/inputs/PresetsButtons/PresetsButtons.component'

import type { SidebarSectionFormProps } from '../../forms/forms.types'

export interface AppearanceStyleControlsProps extends SidebarSectionFormProps {
  paperBackgroundColor: string
}

export function AppearanceStyleControls({
  values,
  onChange,
  paperBackgroundColor,
}: AppearanceStyleControlsProps): ReactNode {
  const presets = useMemo(() => getAppearanceStylePresets(paperBackgroundColor), [paperBackgroundColor])

  const handlePresetClick = (value: string): void => {
    const preset = presets[value as AppearanceStylePresetKey]

    applyPresetStyle((styleValue) => onChange('iframeStyleJson', styleValue), preset?.iframe)
    applyPresetStyle((styleValue) => onChange('appWrapperStyleJson', styleValue), preset?.appWrapper)
    applyPresetStyle((styleValue) => onChange('bodyWrapperStyleJson', styleValue), preset?.bodyWrapper)
    applyPresetStyle((styleValue) => onChange('cardStyleJson', styleValue), preset?.card)
  }

  const iframeStyleJsonError = useAsyncJsonError(values.iframeStyleJson)
  const appWrapperStyleJsonError = useAsyncJsonError(values.appWrapperStyleJson)
  const bodyWrapperStyleJsonError = useAsyncJsonError(values.bodyWrapperStyleJson)
  const cardStyleJsonError = useAsyncJsonError(values.cardStyleJson)

  return (
    <Stack spacing={2.4}>
      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          Presets
        </Typography>
        <PresetsButtons presets={APPEARANCE_STYLE_PRESET_OPTIONS} onPresetClick={handlePresetClick} />
        <Typography sx={{ marginTop: '0.8rem', color: 'text.secondary', display: 'block' }} variant="caption">
          Styles below may need adjusting for your environment (e.g. use position: fixed instead of position: absolute
          for some presets).
        </Typography>
      </Box>
      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          Iframe (host)
        </Typography>
        <JsonInput
          label="Iframe styles (JSON)"
          name="iframeStyleJson"
          value={values.iframeStyleJson}
          onChange={onChange}
          error={iframeStyleJsonError.error}
          helperText={iframeStyleJsonError.helperText}
        />
      </Box>

      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          #appWrapper (inside iframe)
        </Typography>
        <JsonInput
          label="App wrapper styles (JSON)"
          name="appWrapperStyleJson"
          value={values.appWrapperStyleJson}
          onChange={onChange}
          error={appWrapperStyleJsonError.error}
          helperText={appWrapperStyleJsonError.helperText}
        />
      </Box>

      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          #bodyWrapper (inside iframe)
        </Typography>
        <JsonInput
          label="Body wrapper styles (JSON)"
          name="bodyWrapperStyleJson"
          value={values.bodyWrapperStyleJson}
          onChange={onChange}
          error={bodyWrapperStyleJsonError.error}
          helperText={bodyWrapperStyleJsonError.helperText}
        />
      </Box>

      <Box>
        <Typography sx={{ marginBottom: '0.8rem' }} variant="subtitle2">
          #card (inside iframe)
        </Typography>
        <JsonInput
          label="Card styles (JSON)"
          name="cardStyleJson"
          value={values.cardStyleJson}
          onChange={onChange}
          error={cardStyleJsonError.error}
          helperText={cardStyleJsonError.helperText}
        />
      </Box>
    </Stack>
  )
}
