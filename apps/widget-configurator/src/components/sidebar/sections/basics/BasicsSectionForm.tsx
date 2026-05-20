import type { ChangeEvent, Dispatch, ReactNode, SetStateAction } from 'react'

import { SupportedLocale } from '@cowprotocol/common-const'

import { IS_IFRAME } from '../../../../configurator.constants'
import { COMMENTS_BY_PARAM_NAME } from '../../../snippet/snippet.const'
import { LocaleControl } from '../../../ui/controls/Select/LocaleControl'
import { ModeControl } from '../../../ui/controls/Select/ModeControl'
import { TextInput } from '../../../ui/controls/TextInput/TextInput.component'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface BasicsSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

function resolveNextState<T>(current: T, next: SetStateAction<T>): T {
  return typeof next === 'function' ? (next as (prevState: T) => T)(current) : next
}

export function BasicsSectionForm({ values, onChange }: BasicsSectionFormProps): ReactNode {
  const localeState: [SupportedLocale | '', Dispatch<SetStateAction<SupportedLocale | ''>>] = [
    values.locale,
    (nextValue) => onChange('locale', resolveNextState(values.locale, nextValue)),
  ]

  const handleModeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event)
  }

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
      {!IS_IFRAME ? <ModeControl value={values.widgetMode} onChange={handleModeChange} /> : null}
      <LocaleControl state={localeState} />
    </>
  )
}
