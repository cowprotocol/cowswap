import type { ReactNode } from 'react'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { TextInput } from '../../../ui/inputs/TextInput/TextInput.component'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

type WidgetSounds = keyof NonNullable<CowSwapWidgetParams['sounds']>

interface CustomizationSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function CustomizationSectionForm({ values, onChange }: CustomizationSectionFormProps): ReactNode {
  const customImages = values.customImages || {}
  const customSounds = values.customSounds || {}

  const valueNullAsString = (value: string | undefined | null): string => (value === null ? 'null' : value || '')
  const handleSoundChange =
    (type: WidgetSounds) =>
    (name: string, value: string | null): void => {
      const nextValue = value === 'null' ? null : value || ''
      onChange('customSounds', { ...customSounds, [type]: nextValue })
    }

  return (
    <>
      <TextInput
        name="customImages-emptyOrders"
        label="Empty orders image URL"
        value={customImages.emptyOrders || ''}
        onChange={(_, value) => onChange('customImages', { ...customImages, emptyOrders: value || '' })}
      />
      <TextInput
        name="customSounds-postOrder"
        label="Submitted order sound URL"
        value={valueNullAsString(customSounds.postOrder)}
        onChange={handleSoundChange('postOrder')}
        helperText='Set literal "null" to disable this sound.'
      />
      <TextInput
        name="customSounds-orderExecuted"
        label="Executed order sound URL"
        value={valueNullAsString(customSounds.orderExecuted)}
        onChange={handleSoundChange('orderExecuted')}
        helperText='Set literal "null" to disable this sound.'
      />
      <TextInput
        name="customSounds-orderError"
        label="Failed order sound URL"
        value={valueNullAsString(customSounds.orderError)}
        onChange={handleSoundChange('orderError')}
        helperText='Set literal "null" to disable this sound.'
      />
    </>
  )
}
