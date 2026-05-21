import { Dispatch, ReactNode, SetStateAction } from 'react'

import { LOCALE_DISPLAY_NAMES, SupportedLocale, SUPPORTED_LOCALES } from '@cowprotocol/common-const'

import { SelectInput } from './SelectInput'

const LABEL = 'Forced locale'
const LABEL_ID = 'select-locale-label'

type LocaleControlState = [SupportedLocale | '', Dispatch<SetStateAction<SupportedLocale | ''>>]

export function LocaleControl({ state }: { state: LocaleControlState }): ReactNode {
  const [locale, setLocale] = state

  return (
    <SelectInput
      labelId={LABEL_ID}
      id="select-locale"
      name="locale"
      label={LABEL}
      value={locale}
      displayEmpty
      options={[
        { label: 'Browser default', value: '' },
        ...SUPPORTED_LOCALES.map((option) => ({ label: LOCALE_DISPLAY_NAMES[option] || option, value: option })),
      ]}
      onChange={(_, value) => {
        if (Array.isArray(value)) return
        setLocale(value as SupportedLocale | '')
      }}
      renderValue={(selected) => {
        if (!selected || Array.isArray(selected)) {
          return 'Browser default'
        }

        return LOCALE_DISPLAY_NAMES[selected as SupportedLocale] || selected
      }}
    />
  )
}
