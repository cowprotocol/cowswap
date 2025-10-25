import { ReactNode } from 'react'

import EDIT from '@cowprotocol/assets/cow-swap/edit.svg'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'
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
        <styledEl.PartialAmountWrapper
          onClick={() => {
            if (isPartialApproveEnabled && changeApproveAmount) {
              changeApproveAmount()
            }
          }}
        >
          <TokenAmount amount={amountToApprove} /> <TokenSymbol token={amountToApprove.currency} />{' '}
          <styledEl.EditIcon>
            <SVG src={EDIT} description="Edit" />
          </styledEl.EditIcon>
        </styledEl.PartialAmountWrapper>
      </Option>
      <Option isActive={!isPartialApproveEnabled} onClick={() => enablePartialApprove(false)} title={'Full approval'}>
        Unlimited one-time
      </Option>
    </styledEl.ToggleWrapper>
  )
}
