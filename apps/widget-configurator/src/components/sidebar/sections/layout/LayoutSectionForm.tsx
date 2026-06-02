import type { ReactNode } from 'react'

import { AppearanceStyleControls } from '../../../controls/AppearanceStyleControls'
import { SwitchInput } from '../../../ui/controls/SwitchInput/SwitchInput'

import type { JsonState, OnJsonStateChange } from '../../../../hooks/useJsonState'
import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'
import type * as CSS from 'csstype'

interface LayoutJsonStates {
  iframeStyleJson: JsonState<CSS.Properties>
  appWrapperStyleJson: JsonState<CSS.Properties>
  bodyWrapperStyleJson: JsonState<CSS.Properties>
  cardStyleJson: JsonState<CSS.Properties>
  onIframeStyleJson: OnJsonStateChange
  onAppWrapperStyleJson: OnJsonStateChange
  onBodyWrapperStyleJson: OnJsonStateChange
  onCardStyleJson: OnJsonStateChange
}

export interface LayoutSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
  paperBackgroundColor: string
  jsonStates: LayoutJsonStates
}

export function LayoutSectionForm({
  values,
  onChange,
  paperBackgroundColor,
  jsonStates,
}: LayoutSectionFormProps): ReactNode {
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
      <AppearanceStyleControls
        paperBackgroundColor={paperBackgroundColor}
        iframeStyleJson={jsonStates.iframeStyleJson}
        onIframeStyleJson={jsonStates.onIframeStyleJson}
        appWrapperStyleJson={jsonStates.appWrapperStyleJson}
        onAppWrapperStyleJson={jsonStates.onAppWrapperStyleJson}
        bodyWrapperStyleJson={jsonStates.bodyWrapperStyleJson}
        onBodyWrapperStyleJson={jsonStates.onBodyWrapperStyleJson}
        cardStyleJson={jsonStates.cardStyleJson}
        onCardStyleJson={jsonStates.onCardStyleJson}
      />
    </>
  )
}
