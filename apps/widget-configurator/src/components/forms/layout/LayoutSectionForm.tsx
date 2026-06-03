import type { ReactNode } from 'react'

import { AppearanceStyleControls } from '../../controls/AppearanceStyleControls/AppearanceStyleControls.component'
import { SwitchInput } from '../../ui/inputs/SwitchInput/SwitchInput'

import type { SidebarSectionFormProps } from '../forms.types'

export interface LayoutSectionFormProps extends SidebarSectionFormProps {
  paperBackgroundColor: string
}

export function LayoutSectionForm({ values, onChange, paperBackgroundColor }: LayoutSectionFormProps): ReactNode {
  return (
    <>
      <SwitchInput
        checked={values.autoResizeEnabled}
        label="Auto-resize iframe"
        onChange={(checked) => onChange('autoResizeEnabled', checked)}
        helperText="When enabled, the iframe height adjusts automatically to fit its content."
      />
      <SwitchInput
        checked={values.showIframeOutline}
        label="Show iframe outline"
        onChange={(checked) => onChange('showIframeOutline', checked)}
        tooltip="Preview-only visual aid to see the iframe boundaries. This setting is not included in the exported widget code."
      />
      <AppearanceStyleControls values={values} onChange={onChange} paperBackgroundColor={paperBackgroundColor} />
    </>
  )
}
