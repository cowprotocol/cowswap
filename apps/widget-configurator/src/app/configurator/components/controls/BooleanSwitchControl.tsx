import { ReactNode } from 'react'

import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

interface BooleanSwitchControlProps {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
  helperText?: ReactNode
}

export function BooleanSwitchControl({ checked, label, onChange, helperText }: BooleanSwitchControlProps): ReactNode {
  return (
    <Box>
      <FormControlLabel
        sx={{
          margin: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        label={label}
        labelPlacement="start"
        control={<Switch size="small" checked={checked} onChange={(_, nextChecked) => onChange(nextChecked)} />}
      />
      {helperText ? (
        <Typography sx={{ marginTop: '0.4rem', color: 'text.secondary', display: 'block' }} variant="caption">
          {helperText}
        </Typography>
      ) : null}
    </Box>
  )
}
