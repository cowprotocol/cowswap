import { FocusEvent, KeyboardEvent, ReactNode, useState } from 'react'

import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { HoverTooltip, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'
import { ChevronDown, ChevronUp, HelpCircle } from 'react-feather'

import * as styledEl from './styledEl'

import { ApproveConfirmationProps } from './index'

const maxAmountLength = 64
const digitRegex = /^\d$/

// eslint-disable-next-line max-lines-per-function
export function AdvancedApprove({
  amountToApprove,
  handleApprove,
}: Pick<ApproveConfirmationProps, 'amountToApprove' | 'handleApprove'>): ReactNode {
  const currency = amountToApprove.currency

  const defaultAmountToApprove = amountToApprove.toExact()
  const [isAmountInputFocused, setIsAmountInputFocused] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [approveAmountStr, setApproveAmountStr] = useState(defaultAmountToApprove)
  const [inputChangedText, setInputChangedText] = useState(approveAmountStr)
  const [isChangedTextValid, setIsChangedTextValid] = useState(true)
  const [amountToApproveOverride, setAmountToApproveOverride] = useState<CurrencyAmount<Currency> | null>(null)

  const onFilterAmountInput = (e: KeyboardEvent<HTMLDivElement>): void => filterAmountInput(e, inputChangedText)

  const onAmountTyping = (e: KeyboardEvent<HTMLDivElement>): void => {
    const content = (e.target as HTMLDivElement).innerText

    try {
      const parsedAmount = tryParseCurrencyAmount(content, currency)

      if (parsedAmount) {
        setIsChangedTextValid(true)
        setAmountToApproveOverride(parsedAmount)
      } else {
        setIsChangedTextValid(false)
      }
    } catch {
      setIsChangedTextValid(false)
    }

    setInputChangedText(content)
  }

  const onBlur = (e: FocusEvent<HTMLDivElement>): void => {
    const parsedValue = parseFloat(inputChangedText)

    setIsAmountInputFocused(false)

    if (isNaN(parsedValue) || parsedValue < 0) {
      setApproveAmountStr(defaultAmountToApprove)
      setInputChangedText(defaultAmountToApprove)

      e.target.innerText = defaultAmountToApprove
      return
    }

    setApproveAmountStr(inputChangedText)
  }

  return (
    <styledEl.AdvancedWrapper open={isAdvancedOpen} error={!isChangedTextValid}>
      <styledEl.AdvancedDropdown height={isAdvancedOpen ? 500 : 0}>
        <styledEl.TextWrapper>
          <Trans>Allow spending</Trans>:
          <styledEl.AmountInput
            translate="no"
            invalid={!isChangedTextValid}
            contentEditable={true}
            onKeyDown={onFilterAmountInput}
            onKeyUp={onAmountTyping}
            onBlur={onBlur}
            onFocus={() => setIsAmountInputFocused(true)}
            suppressContentEditableWarning={true}
          >
            {approveAmountStr}
          </styledEl.AmountInput>
          <TokenSymbol token={currency} />
        </styledEl.TextWrapper>
        {!isChangedTextValid && (
          <styledEl.ValidationText>
            <Trans>Entered amount is invalid</Trans>
          </styledEl.ValidationText>
        )}
        <styledEl.AdvancedApproveButton
          disabled={isAmountInputFocused || !isChangedTextValid}
          onClick={() =>
            handleApprove(
              amountToApproveOverride
                ? BigInt(amountToApproveOverride.quotient.toString())
                : BigInt(amountToApprove.quotient.toString()),
            )
          }
        >
          <span>
            <Trans>Approve</Trans>
          </span>
          <HelpTooltip>
            <Trans>
              In case you want to give allowance only for the trade amount, use the advanced mode. You can also change
              the amount manually.
            </Trans>
          </HelpTooltip>
        </styledEl.AdvancedApproveButton>
      </styledEl.AdvancedDropdown>
      <styledEl.AdvancedDropdownButton onClick={() => setIsAdvancedOpen((s) => !s)}>
        <span>
          <Trans>Advanced</Trans>
        </span>
        {!isAdvancedOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </styledEl.AdvancedDropdownButton>
    </styledEl.AdvancedWrapper>
  )
}

function filterAmountInput(e: KeyboardEvent<HTMLDivElement>, inputChangedText: string): void {
  if (e.altKey || e.ctrlKey || e.metaKey) return

  if (e.key.toLowerCase() !== 'backspace' && inputChangedText.length >= maxAmountLength) {
    e.preventDefault()
    return
  }

  if (e.key === '.') {
    if (inputChangedText.includes('.')) {
      e.preventDefault()
      return
    }
  } else if ((e.key.length === 1 && !digitRegex.test(e.key)) || e.key.toLowerCase() === 'enter') {
    e.preventDefault()
    return
  }
}

export function HelpTooltip({ children }: { children: ReactNode }): ReactNode {
  return (
    <HoverTooltip wrapInContainer placement="top" content={children}>
      <HelpCircle size="20" />
    </HoverTooltip>
  )
}
