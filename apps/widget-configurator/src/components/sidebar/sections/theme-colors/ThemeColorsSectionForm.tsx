import type { ReactNode } from 'react'

import { PaletteControl } from '../../../controls/PaletteControl'
import { ThemeControl, type ThemeOptionValue } from '../../../controls/ThemeControl'

import type { useColorPaletteManager } from '../../../../hooks/useColorPaletteManager'
import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

export interface ThemeColorsSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
  paletteManager: ReturnType<typeof useColorPaletteManager>
}

export function ThemeColorsSectionForm({ values, onChange, paletteManager }: ThemeColorsSectionFormProps): ReactNode {
  return (
    <>
      <ThemeControl name="theme" selectedValue={values.theme as ThemeOptionValue} onChange={onChange} />
      <PaletteControl paletteManager={paletteManager} />
    </>
  )
}
