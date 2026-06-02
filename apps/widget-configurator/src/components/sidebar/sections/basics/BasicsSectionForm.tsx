import type { ReactNode } from 'react'

import { LOCALE_DISPLAY_NAMES, SupportedLocale } from '@cowprotocol/common-const'

import { LOCALE_OPTIONS } from '../../../../configurator.constants'
import { ModeControl } from '../../../controls/ModeControl'
import { COMMENTS_BY_PARAM_NAME } from '../../../snippet/snippet.const'
import { SelectInput } from '../../../ui/inputs/Select/SelectInput'
import { TextInput } from '../../../ui/inputs/TextInput/TextInput.component'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface BasicsSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function BasicsSectionForm({ values, onChange }: BasicsSectionFormProps): ReactNode {
  return (
    <>
      <TextInput
        name="appCode"
        label="App code"
        value={values.appCode}
        onChange={onChange}
        helperText={COMMENTS_BY_PARAM_NAME.appCode}
        inputProps={{ maxLength: 50 }}
      />

      <ModeControl value={values.widgetMode} onChange={onChange} />

      <SelectInput
        name="locale"
        label="Forced locale"
        value={values.locale}
        displayEmpty
        options={LOCALE_OPTIONS}
        onChange={onChange}
        renderValue={(selected) => {
          if (!selected || Array.isArray(selected)) {
            return 'Browser default'
          }

          return LOCALE_DISPLAY_NAMES[selected as SupportedLocale] || selected
        }}
      />
    </>
  )
}
