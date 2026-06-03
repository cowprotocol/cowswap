import type { ReactNode } from 'react'

import { THEME_OPTIONS, ThemeOptionValue } from '../../../configurator.constants'
import { PaletteControl } from '../../controls/PaletteControl'
import { SelectInput } from '../../ui/inputs/Select/single/SelectInput.component'

import type { useColorPaletteManager } from '../../../hooks/useColorPaletteManager'
import type { SidebarSectionFormProps } from '../forms.types'

export interface ThemeColorsSectionFormProps extends SidebarSectionFormProps {
  paletteManager: ReturnType<typeof useColorPaletteManager>
}

export function ThemeColorsSectionForm({ values, onChange, paletteManager }: ThemeColorsSectionFormProps): ReactNode {
  return (
    <>
      <SelectInput
        name="theme"
        value={values.theme as ThemeOptionValue}
        label="Theme"
        options={THEME_OPTIONS}
        onChange={onChange}
      />

      <PaletteControl paletteManager={paletteManager} />
    </>
  )
}
