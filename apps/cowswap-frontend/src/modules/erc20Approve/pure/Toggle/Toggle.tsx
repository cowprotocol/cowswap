import { ReactNode } from 'react'

import EDIT from '@cowprotocol/assets/cow-swap/edit.svg'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { Option } from './Option'
import * as styledEl from './styled'

export function Toggle({
  isPartialApproveSelected,
  selectPartialApprove,
  amountToApprove,
  changeApproveAmount,
}: {
  isPartialApproveSelected: boolean
  selectPartialApprove: (isPartialApproveEnabled: boolean) => void
  amountToApprove: CurrencyAmount<Currency>
  changeApproveAmount?: () => void
}): ReactNode {
  const { t } = useLingui()

  return (
    <styledEl.ToggleWrapper>
      <Option
        isActive={isPartialApproveSelected}
        onClick={() => selectPartialApprove(true)}
        title={t`Partial approval`}
      >
        <styledEl.PartialAmountWrapper
          onClick={() => {
            if (isPartialApproveSelected && changeApproveAmount) {
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
      <Option isActive={!isPartialApproveSelected} onClick={() => selectPartialApprove(false)} title={t`Full approval`}>
        <Trans>Unlimited one-time</Trans>
      </Option>
    </styledEl.ToggleWrapper>
  )
}
