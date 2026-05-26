import { ReactNode } from 'react'

import svgEditSrc from '@cowprotocol/assets/cow-swap/edit.svg'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { Option } from './Option'
import * as styledEl from './styled'

export function Toggle({
  isPartialApproveSelected,
  selectPartialApprove,
  amountToApprove,
  changeApproveAmount,
  disabled = false,
}: {
  isPartialApproveSelected: boolean
  selectPartialApprove: (isPartialApproveEnabled: boolean) => void
  amountToApprove: CurrencyAmount<Currency>
  changeApproveAmount?: () => void
  disabled?: boolean
}): ReactNode {
  const { t } = useLingui()

  const handleSelect = (value: boolean): void => {
    if (disabled) return
    selectPartialApprove(value)
  }

  return (
    <styledEl.ToggleWrapper>
      <Option isActive={isPartialApproveSelected} onClick={() => handleSelect(true)} title={t`Partial approval`}>
        <styledEl.PartialAmountWrapper
          onClick={() => {
            if (isPartialApproveSelected && changeApproveAmount && !disabled) {
              changeApproveAmount()
            }
          }}
        >
          <TokenAmount amount={amountToApprove} /> <TokenSymbol token={amountToApprove.currency} />{' '}
          <styledEl.EditIcon>
            <SVG src={svgEditSrc} description="Edit" />
          </styledEl.EditIcon>
        </styledEl.PartialAmountWrapper>
      </Option>
      <Option isActive={!isPartialApproveSelected} onClick={() => handleSelect(false)} title={t`Full approval`}>
        <Trans>Unlimited one-time</Trans>
      </Option>
    </styledEl.ToggleWrapper>
  )
}
