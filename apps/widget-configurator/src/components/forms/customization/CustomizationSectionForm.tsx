import { useCallback, type ReactNode } from 'react'

import { TextInput } from '../../ui/inputs/TextInput/TextInput.component'

import type { SidebarSectionFormProps } from '../forms.types'

const valueNullAsString = (value: string | undefined | null): string => (value === null ? 'null' : value || '')

const customizationFields = ['customImages', 'customSounds'] as const

type CustomizationField = (typeof customizationFields)[number]

export function CustomizationSectionForm({ values, onChange }: SidebarSectionFormProps): ReactNode {
  const { customImages, customSounds } = values

  const handleChange = useCallback(
    (name: string, value: string | null): void => {
      const [fieldName, subFieldName] = name.split('.') as [CustomizationField, string]

      if (!fieldName || !subFieldName || !customizationFields.includes(fieldName)) {
        console.warn('[COW][CONFIGURATOR] Missing field name in change event:', name)
        return
      }

      const prevValues = {
        customImages,
        customSounds,
      }[fieldName]

      onChange(fieldName, { ...prevValues, [subFieldName]: value === 'null' ? null : value || '' })
    },
    [customImages, customSounds, onChange],
  )

  return (
    <>
      <TextInput
        name="customImages.emptyOrders"
        label="Empty orders image URL"
        value={customImages?.emptyOrders || ''}
        onChange={handleChange}
      />
      <TextInput
        name="customSounds.postOrder"
        label="Submitted order sound URL"
        value={valueNullAsString(customSounds?.postOrder)}
        onChange={handleChange}
        helperText='Set literal "null" to disable this sound.'
      />
      <TextInput
        name="customSounds.orderExecuted"
        label="Executed order sound URL"
        value={valueNullAsString(customSounds?.orderExecuted)}
        onChange={handleChange}
        helperText='Set literal "null" to disable this sound.'
      />
      <TextInput
        name="customSounds.orderError"
        label="Failed order sound URL"
        value={valueNullAsString(customSounds?.orderError)}
        onChange={handleChange}
        helperText='Set literal "null" to disable this sound.'
      />
    </>
  )
}
