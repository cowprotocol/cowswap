import { ChangeEvent, ReactNode, useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { SettingHeading } from './SettingHeading'

import { DEFAULT_IFRAME_WIDTH, MIN_IFRAME_WIDTH_PX } from '../consts'

const TOOLTIP_TITLE =
  'Controls the width of the outer iFrame element. Default uses 100% of the available container width.'

type IframeWidthMode = 'default' | 'custom'

interface IframeWidthControlProps {
  value: string
  onChange(value: string): void
}

function getWidthInputValue(value: string): string {
  return value.replace(/px$/, '')
}

export function IframeWidthControl({ value, onChange }: IframeWidthControlProps): ReactNode {
  const [widthMode, setWidthMode] = useState<IframeWidthMode>(value ? 'custom' : 'default')
  const [customWidth, setCustomWidth] = useState<string>(() => getWidthInputValue(value))

  useEffect(() => {
    setWidthMode(value ? 'custom' : 'default')
    setCustomWidth(getWidthInputValue(value))
  }, [value])

  const handleModeSelect = (nextMode: IframeWidthMode): void => {
    setWidthMode(nextMode)

    if (nextMode === 'default') {
      onChange('')

      return
    }

    if (!value) {
      const nextWidth = String(MIN_IFRAME_WIDTH_PX)

      setCustomWidth(nextWidth)
      onChange(`${nextWidth}px`)
    }
  }

  const handleWidthChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextWidth = event.target.value
    setCustomWidth(nextWidth)

    const parsedWidth = Number(nextWidth)

    if (!nextWidth || Number.isNaN(parsedWidth) || parsedWidth < MIN_IFRAME_WIDTH_PX) {
      return
    }

    onChange(`${Math.round(parsedWidth)}px`)
  }

  const handleBlur = (): void => {
    if (widthMode !== 'custom') {
      return
    }

    const parsedWidth = Number(customWidth)
    const normalizedWidth =
      !customWidth || Number.isNaN(parsedWidth)
        ? MIN_IFRAME_WIDTH_PX
        : Math.max(MIN_IFRAME_WIDTH_PX, Math.round(parsedWidth))

    setCustomWidth(String(normalizedWidth))
    onChange(`${normalizedWidth}px`)
  }

  const helperText =
    customWidth && Number(customWidth) < MIN_IFRAME_WIDTH_PX
      ? `Minimum custom width is ${MIN_IFRAME_WIDTH_PX}px.`
      : 'Uses a fixed pixel width for the outer iFrame.'

  return (
    <div>
      <SettingHeading title="iFrame width" tooltip={TOOLTIP_TITLE} />
      <Typography color="text.secondary" variant="body2" sx={{ mb: 1.2 }}>
        Default: {DEFAULT_IFRAME_WIDTH}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: widthMode === 'custom' ? 1.2 : 0 }}>
        <Button
          onClick={() => handleModeSelect('default')}
          size="small"
          variant={widthMode === 'default' ? 'contained' : 'outlined'}
        >
          Default
        </Button>
        <Button
          onClick={() => handleModeSelect('custom')}
          size="small"
          variant={widthMode === 'custom' ? 'contained' : 'outlined'}
        >
          Custom
        </Button>
      </Stack>
      <Collapse in={widthMode === 'custom'} unmountOnExit>
        <TextField
          fullWidth
          id="iframeWidth"
          label="Custom iFrame width"
          type="number"
          helperText={helperText}
          inputProps={{ min: MIN_IFRAME_WIDTH_PX, step: 1 }}
          placeholder={String(MIN_IFRAME_WIDTH_PX)}
          size="small"
          value={customWidth}
          onBlur={handleBlur}
          onChange={handleWidthChange}
        />
      </Collapse>
    </div>
  )
}
