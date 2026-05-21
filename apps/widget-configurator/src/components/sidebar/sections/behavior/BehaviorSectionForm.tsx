import type { ReactNode } from 'react'

import { BooleanSwitchControl } from '../../../ui/controls/BooleanSwitch/BooleanSwitchControl'
import { NumberInput } from '../../../ui/controls/NumberInput/NumberInput.component'

import type { UseToastsManagerReturn } from '../../../../hooks/useToastsManager'
import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

export interface BehaviorSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
  toastManager: UseToastsManagerReturn
}

export function BehaviorSectionForm({ values, onChange, toastManager }: BehaviorSectionFormProps): ReactNode {
  return (
    <>
      <BooleanSwitchControl
        checked={toastManager.disableToastMessages}
        label="Use app toasts"
        helperText="When off, the widget keeps toast messages inside the iframe."
        onChange={toastManager.setToastMessagesInDappMode}
      />
      <BooleanSwitchControl
        checked={!values.disableProgressBar}
        label="Show progress bar"
        onChange={(enabled) => onChange('disableProgressBar', !enabled)}
      />
      <BooleanSwitchControl
        checked={!values.disablePostTradeTips}
        label="Show post-trade tips"
        onChange={(enabled) => onChange('disablePostTradeTips', !enabled)}
      />
      <BooleanSwitchControl
        checked={!values.disableTokenImport}
        label="Allow custom token imports"
        onChange={(enabled) => onChange('disableTokenImport', !enabled)}
      />
      <BooleanSwitchControl
        checked={!values.hideRecentTokens}
        label="Show recent tokens"
        onChange={(enabled) => onChange('hideRecentTokens', !enabled)}
      />
      <BooleanSwitchControl
        checked={!values.hideFavoriteTokens}
        label="Show favorite tokens"
        onChange={(enabled) => onChange('hideFavoriteTokens', !enabled)}
      />
      <BooleanSwitchControl
        checked={!values.hideBridgeInfo}
        label="Show bridge info"
        onChange={(enabled) => onChange('hideBridgeInfo', !enabled)}
      />
      <BooleanSwitchControl
        checked={!values.hideOrdersTable}
        label="Show orders table"
        onChange={(enabled) => onChange('hideOrdersTable', !enabled)}
      />
      <BooleanSwitchControl
        checked={values.disableTradeWhenPriceImpactIsUnknown}
        label="Block trade if price impact is unknown"
        onChange={(enabled) => onChange('disableTradeWhenPriceImpactIsUnknown', enabled)}
      />
      <NumberInput
        name="disableTradeWhenPriceImpactIsHigherThan"
        id="disableTradeWhenPriceImpactIsHigherThan"
        label="Block trade above price impact (%)"
        value={values.disableTradeWhenPriceImpactIsHigherThan}
        onChange={onChange}
        emptyValue={undefined}
        helperText="Leave empty to disable"
        inputProps={{
          min: 0,
          step: 'any',
        }}
      />
    </>
  )
}
