import type { ChangeEvent, ReactNode } from 'react'

import TextField from '@mui/material/TextField'

import { BooleanSwitchControl } from '../../../ui/controls/BooleanSwitch/BooleanSwitchControl'

import type { UseToastsManagerReturn } from '../../../../hooks/useToastsManager'
import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

export interface BehaviorSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
  toastManager: UseToastsManagerReturn
}

export function BehaviorSectionForm({ values, onChange, toastManager }: BehaviorSectionFormProps): ReactNode {
  const setBlockPriceImpactAboveValue = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.target.value.trim()

    if (!nextValue) {
      onChange('disableTradeWhenPriceImpactIsHigherThan', undefined)
      return
    }

    const parsedValue = Number(nextValue)
    if (Number.isNaN(parsedValue)) return

    onChange('disableTradeWhenPriceImpactIsHigherThan', parsedValue)
  }

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
      <TextField
        fullWidth
        margin="dense"
        name="disableTradeWhenPriceImpactIsHigherThan"
        id="disableTradeWhenPriceImpactIsHigherThan"
        label="Block trade above price impact (%)"
        type="number"
        value={values.disableTradeWhenPriceImpactIsHigherThan ?? ''}
        onChange={setBlockPriceImpactAboveValue}
        size="medium"
        helperText="Leave empty to disable"
        inputProps={{
          min: 0,
          step: 'any',
        }}
      />
    </>
  )
}
