import type { ReactNode } from 'react'

import { LOCALE_OPTIONS } from '../../../../configurator.constants'
import { ModeControl } from '../../../controls/ModeControl'
import { COMMENTS_BY_PARAM_NAME } from '../../../snippet/snippet.const'
import { SelectInput } from '../../../ui/inputs/Select/single/SelectInput.component'
import { TextInput } from '../../../ui/inputs/TextInput/TextInput.component'

import type { SidebarSectionFormProps } from '../section.types'

export function BasicsSectionForm({ values, onChange }: SidebarSectionFormProps): ReactNode {
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
        emptyLabel
        options={LOCALE_OPTIONS}
        onChange={onChange}
      />
    </>
  )
}
