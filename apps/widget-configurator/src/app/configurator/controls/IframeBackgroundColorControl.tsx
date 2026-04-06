import { ReactNode, useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { MuiColorInput } from 'mui-color-input'

import { SettingHeading } from './SettingHeading'

import { DEFAULT_IFRAME_BACKGROUND_COLOR } from '../consts'

const TOOLTIP_TITLE =
  'Sets the background color on the outer iFrame element. Default is transparent, so the host page shows through.'

type IframeBackgroundColorMode = 'default' | 'custom'

interface IframeBackgroundColorControlProps {
  value: string
  defaultCustomColor: string
  onChange(value: string): void
}

export function IframeBackgroundColorControl({
  value,
  defaultCustomColor,
  onChange,
}: IframeBackgroundColorControlProps): ReactNode {
  const [colorMode, setColorMode] = useState<IframeBackgroundColorMode>(value ? 'custom' : 'default')

  useEffect(() => {
    setColorMode(value ? 'custom' : 'default')
  }, [value])

  const handleModeSelect = (nextMode: IframeBackgroundColorMode): void => {
    setColorMode(nextMode)

    if (nextMode === 'default') {
      onChange('')

      return
    }

    if (!value) {
      onChange(defaultCustomColor)
    }
  }

  return (
    <div>
      <SettingHeading title="iFrame background color" tooltip={TOOLTIP_TITLE} />
      <Typography color="text.secondary" variant="body2" sx={{ mb: 1.2 }}>
        Default: {DEFAULT_IFRAME_BACKGROUND_COLOR}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: colorMode === 'custom' ? 1.2 : 0 }}>
        <Button
          onClick={() => handleModeSelect('default')}
          size="small"
          variant={colorMode === 'default' ? 'contained' : 'outlined'}
        >
          Default
        </Button>
        <Button
          onClick={() => handleModeSelect('custom')}
          size="small"
          variant={colorMode === 'custom' ? 'contained' : 'outlined'}
        >
          Custom
        </Button>
      </Stack>
      <Collapse in={colorMode === 'custom'} unmountOnExit>
        <MuiColorInput
          fullWidth
          format="hex"
          helperText="Sets the outer iFrame background color."
          isAlphaHidden
          label="Custom iFrame background color"
          size="small"
          value={value || defaultCustomColor}
          onChange={onChange}
        />
      </Collapse>
    </div>
  )
}
