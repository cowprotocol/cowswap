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
        checked={values.disableScrollbars}
        label="Disable scrollbars"
        onChange={(checked) => onChange('disableScrollbars', checked)}
        helperText="Only disable scrollbars when your iframe height is adjusted dynamically using var(--dynamicHeight) and is not height-constrained (e.g. no max-height). Otherwise leave this off and use a fixed iframe height instead of var(--dynamicHeight)."
      />
      <SwitchInput
        checked={values.showIframeOutline}
        label="Show iframe outline"
        onChange={(checked) => onChange('showIframeOutline', checked)}
        helperText="Preview-only visual aid to see the iframe boundaries. This setting is not included in the exported widget code."
      />
      <AppearanceStyleControls values={values} onChange={onChange} paperBackgroundColor={paperBackgroundColor} />
    </>
  )
}
