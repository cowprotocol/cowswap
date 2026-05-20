import type { Dispatch, ReactNode, SetStateAction } from 'react'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { CustomImagesControl } from '../../../controls/CustomImagesControl'
import { CustomSoundsControl } from '../../../controls/CustomSoundsControl'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

function resolveNextState<T>(current: T, next: SetStateAction<T>): T {
  return typeof next === 'function' ? (next as (prevState: T) => T)(current) : next
}

interface CustomizationSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function CustomizationSectionForm({ values, onChange }: CustomizationSectionFormProps): ReactNode {
  const customImagesState: [CowSwapWidgetParams['images'], Dispatch<SetStateAction<CowSwapWidgetParams['images']>>] = [
    values.customImages,
    (nextValue) => onChange('customImages', resolveNextState(values.customImages, nextValue)),
  ]

  const customSoundsState: [CowSwapWidgetParams['sounds'], Dispatch<SetStateAction<CowSwapWidgetParams['sounds']>>] = [
    values.customSounds,
    (nextValue) => onChange('customSounds', resolveNextState(values.customSounds, nextValue)),
  ]

  return (
    <>
      <CustomImagesControl state={customImagesState} />
      <CustomSoundsControl state={customSoundsState} />
    </>
  )
}
