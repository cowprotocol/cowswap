import type { ReactNode } from 'react'

import { NumberInput } from '../../ui/inputs/NumberInput/NumberInput.component'
import { SwitchInput } from '../../ui/inputs/SwitchInput/SwitchInput'

import type { UseToastsManagerReturn } from '../../../hooks/useToastsManager'
import type { SidebarSectionFormProps } from '../forms.types'

export interface BehaviorSectionFormProps extends SidebarSectionFormProps {
  toastManager: UseToastsManagerReturn
}

export function BehaviorSectionForm({ values, onChange, toastManager }: BehaviorSectionFormProps): ReactNode {
  return (
    <>
      <SwitchInput
        checked={toastManager.disableToastMessages}
        label="Use app toasts"
        helperText="When off, the widget keeps toast messages inside the iframe."
        onChange={toastManager.setToastMessagesInDappMode}
      />
      <SwitchInput
        checked={!values.disableProgressBar}
        label="Show progress bar"
        onChange={(enabled) => onChange('disableProgressBar', !enabled)}
      />
      <SwitchInput
        checked={!values.disablePostTradeTips}
        label="Show post-trade tips"
        onChange={(enabled) => onChange('disablePostTradeTips', !enabled)}
      />
      <SwitchInput
        checked={!values.disableTokenImport}
        label="Allow custom token imports"
        onChange={(enabled) => onChange('disableTokenImport', !enabled)}
      />
      <SwitchInput
        checked={!values.hideRecentTokens}
        label="Show recent tokens"
        onChange={(enabled) => onChange('hideRecentTokens', !enabled)}
      />
      <SwitchInput
        checked={!values.hideFavoriteTokens}
        label="Show favorite tokens"
        onChange={(enabled) => onChange('hideFavoriteTokens', !enabled)}
      />
      <SwitchInput
        checked={!values.hideBridgeInfo}
        label="Show bridge info"
        onChange={(enabled) => onChange('hideBridgeInfo', !enabled)}
      />
      <SwitchInput
        checked={!values.hideOrdersTable}
        label="Show orders table"
        onChange={(enabled) => onChange('hideOrdersTable', !enabled)}
      />
      <SwitchInput
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
