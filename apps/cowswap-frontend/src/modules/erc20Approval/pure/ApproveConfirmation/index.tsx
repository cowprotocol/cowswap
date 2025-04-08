import { useState, KeyboardEvent, FocusEvent, ReactNode } from 'react'

import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { ButtonPrimary, ButtonSize, HoverTooltip, TokenSymbol } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { ChevronDown, ChevronUp, HelpCircle } from 'react-feather'

import * as styledEl from './styledEl'

const maxAmountLength = 64
const digitRegex = /^\d$/

export interface ApproveConfirmationProps {
  amountToApprove: CurrencyAmount<Currency>
  currentAllowance: BigNumber | undefined
  handleApprove?(amount: CurrencyAmount<Currency>): void
}

export function ApproveConfirmation({ amountToApprove, handleApprove }: ApproveConfirmationProps) {
  const currency = amountToApprove.currency
  const defaultAmountToApprove = amountToApprove.toExact()

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isAmountInputFocused, setIsAmountInputFocused] = useState(false)
  const [approveAmountStr, setApproveAmountStr] = useState(defaultAmountToApprove)
  const [inputChangedText, setInputChangedText] = useState(approveAmountStr)
  const [isChangedTextValid, setIsChangedTextValid] = useState(true)
  const [amountToApproveOverride, setAmountToApproveOverride] = useState<CurrencyAmount<Currency> | null>(null)

  const tokenSymbol = <TokenSymbol token={currency} />

  const filterAmountInput = (e: KeyboardEvent<HTMLDivElement>) => {
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

  const onAmountTyping = (e: KeyboardEvent<HTMLDivElement>) => {
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

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
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

  const onFocus = () => {
    setIsAmountInputFocused(true)
  }

  console.log('TODO handle amountToApproveOverride', amountToApproveOverride)

  return (
    <styledEl.Wrapper>
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={() => handleApprove?.()}>
        <styledEl.ButtonWrapper>
          <span>Default approve</span>
          <HelpTooltip>
            <>
              You must give the CoW Protocol smart contracts permission to use your {tokenSymbol}. If you approve the
              default amount, you will only have to do this once per token.
            </>
          </HelpTooltip>
        </styledEl.ButtonWrapper>
      </ButtonPrimary>
      <styledEl.AdvancedWrapper open={isAdvancedOpen} error={!isChangedTextValid}>
        <styledEl.AdvancedDropdown height={isAdvancedOpen ? 500 : 0}>
          <styledEl.TextWrapper>
            Allow spending:
            <styledEl.AmountInput
              translate="no"
              invalid={!isChangedTextValid}
              contentEditable={true}
              onKeyDown={filterAmountInput}
              onKeyUp={onAmountTyping}
              onBlur={onBlur}
              onFocus={onFocus}
              suppressContentEditableWarning={true}
            >
              {approveAmountStr}
            </styledEl.AmountInput>
            {tokenSymbol}
          </styledEl.TextWrapper>
          {!isChangedTextValid && <styledEl.ValidationText>Entered amount is invalid</styledEl.ValidationText>}
          <styledEl.AdvancedApproveButton
            disabled={isAmountInputFocused || !isChangedTextValid}
            onClick={() => handleApprove?.()}
          >
            <span>Approve</span>
            <HelpTooltip>
              In case you want to give allowance only for the trade amount, use the advanced mode. You can also change
              the amount manually.
            </HelpTooltip>
          </styledEl.AdvancedApproveButton>
        </styledEl.AdvancedDropdown>
        <styledEl.AdvancedDropdownButton onClick={() => setIsAdvancedOpen((s) => !s)}>
          <span>Advanced</span>
          {!isAdvancedOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </styledEl.AdvancedDropdownButton>
      </styledEl.AdvancedWrapper>
    </styledEl.Wrapper>
  )
}

function HelpTooltip({ children }: { children: ReactNode }) {
  return (
    <HoverTooltip wrapInContainer placement="top" content={<Trans>{children}</Trans>}>
      <HelpCircle size="20" />
    </HoverTooltip>
  )
}
