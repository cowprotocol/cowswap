import { JSX } from 'react'

import { StatefulValue } from '@cowprotocol/types'


import { AutoColumn } from 'legacy/components/Column'

import { DeadlineTransactionSettings } from 'modules/tradeWidgetAddons/containers/DeadlineTransactionSettings'
import { TransactionSlippageInput } from 'modules/tradeWidgetAddons/containers/TransactionSlippageInput'

import * as styledEl from './styled'


interface TransactionSettingsProps {
  deadlineState: StatefulValue<number>
}

export function TransactionSettings({ deadlineState }: TransactionSettingsProps): JSX.Element {
  return (
    <styledEl.Wrapper>
      <AutoColumn gap="md">
        <AutoColumn gap="sm">
          <TransactionSlippageInput/>
        </AutoColumn>
        <AutoColumn gap="sm">
          <DeadlineTransactionSettings deadlineState={deadlineState}/>
        </AutoColumn>
      </AutoColumn>
    </styledEl.Wrapper>
  )
}
