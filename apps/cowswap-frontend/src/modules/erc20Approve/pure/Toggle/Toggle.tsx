import React, { ReactNode } from 'react'

import EDIT from '@cowprotocol/assets/cow-swap/edit.svg'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'
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
  const { t } = useLingui()

  return (
    <styledEl.ToggleWrapper>
      <Option isActive={isPartialApproveEnabled} onClick={() => enablePartialApprove(true)} title={t`Partial approval`}>
        <styledEl.PartialAmountWrapper
          onClick={() => {
            if (isPartialApproveEnabled && changeApproveAmount) {
              changeApproveAmount()
            }
          }}
        >
          <TokenAmount amount={amountToApprove} /> <TokenSymbol token={amountToApprove.currency} /> <SVG src={EDIT} />
        </styledEl.PartialAmountWrapper>
      </Option>
      <Option isActive={!isPartialApproveEnabled} onClick={() => enablePartialApprove(false)} title={t`Full approval`}>
        <Trans>Unlimited one-time</Trans>
      </Option>
    </styledEl.ToggleWrapper>
  )
}
