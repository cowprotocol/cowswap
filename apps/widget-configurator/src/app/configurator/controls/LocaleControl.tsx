import { Dispatch, ReactNode, SetStateAction } from 'react'

import { LOCALE_DISPLAY_NAMES, SupportedLocale, SUPPORTED_LOCALES } from '@cowprotocol/common-const'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

const LABEL = 'Forced locale'

type LocaleControlState = [SupportedLocale | '', Dispatch<SetStateAction<SupportedLocale | ''>>]

export function LocaleControl({ state }: { state: LocaleControlState }): ReactNode {
  const [locale, setLocale] = state

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel>{LABEL}</InputLabel>
      <Select
        id="select-locale"
        value={locale}
        onChange={(event) => setLocale(event.target.value as SupportedLocale | '')}
        label={LABEL}
        size="small"
      >
        <MenuItem value="">Browser default</MenuItem>
        {SUPPORTED_LOCALES.map((option) => (
          <MenuItem key={option} value={option}>
            {LOCALE_DISPLAY_NAMES[option] || option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
