import React, { ReactNode } from 'react'

import EDIT from '@cowprotocol/assets/cow-swap/edit.svg'
import { TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import { Option } from './Option'
import * as styledEl from './styled'

export function Toggle({
  isPartialApproveEnabled,
  enablePartialApprove,
  amountToApprove,
  changeApproveAmount,
}: {
  isPartialApproveEnabled: boolean
  enablePartialApprove: (isPartialApproveEnabled: boolean) => void
  amountToApprove: CurrencyAmount<Currency>
  changeApproveAmount?: () => void
}): ReactNode {
  return (
    <styledEl.ToggleWrapper>
      <Option isActive={isPartialApproveEnabled} onClick={() => enablePartialApprove(true)} title={'Partial approval'}>
        <styledEl.PartialApproveWrapper
          onClick={() => {
            if (isPartialApproveEnabled && changeApproveAmount) {
              changeApproveAmount()
            }
          }}
        >
          {amountToApprove.toSignificant(5)} <TokenSymbol token={amountToApprove.currency} /> <SVG src={EDIT} />
        </styledEl.PartialApproveWrapper>
      </Option>
      <Option isActive={!isPartialApproveEnabled} onClick={() => enablePartialApprove(false)} title={'Full approval'}>
        Unlimited one-time
      </Option>
    </styledEl.ToggleWrapper>
  )
}
