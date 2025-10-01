import React, { ReactNode, useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { ButtonConfirmed, ButtonSize, HoverTooltip, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { useTokenSupportsPermit } from 'modules/permit'
import { TradeType } from 'modules/trade'

import * as styledEl from './styled'

import { MAX_APPROVE_AMOUNT } from '../../constants'
import { useApprovalStateForSpender, useApproveCurrency } from '../../hooks'
import { useGeneratePermitInAdvanceToTrade } from '../../hooks/useGeneratePermitInAdvanceToTrade'
import { LegacyApproveButton } from '../../pure/LegacyApproveButton'
import { useIsPartialApproveSelectedByUser } from '../../state'
import { ApprovalState } from '../../types'

export interface TradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  children?: ReactNode
  isDisabled?: boolean
  enablePartialApprove?: boolean
  confirmSwap?: () => void
  ignorePermit?: boolean
  label: string
}

export function TradeApproveButton(props: TradeApproveButtonProps): ReactNode {
  const { amountToApprove, children, enablePartialApprove, confirmSwap, label, ignorePermit } = props
  const isPartialApproveEnabledByUser = useIsPartialApproveSelectedByUser()
  const handleApprove = useApproveCurrency(amountToApprove)

  const spender = useTradeSpenderAddress()
  const { approvalState } = useApprovalStateForSpender(amountToApprove, spender)
  const isPermitSupported = useTokenSupportsPermit(amountToApprove.currency, TradeType.SWAP) && !ignorePermit
  const generatePermitToTrade = useGeneratePermitInAdvanceToTrade(amountToApprove)

  const approveAndSwap = useCallback(async (): Promise<void> => {
    if (isPermitSupported && confirmSwap) {
      const permit = await generatePermitToTrade()
      if (permit) {
        confirmSwap()
      }

      return
    }

    const toApprove = isPartialApproveEnabledByUser ? BigInt(amountToApprove.quotient.toString()) : MAX_APPROVE_AMOUNT
    const tx = await handleApprove(toApprove)
    if (tx && confirmSwap) {
      confirmSwap()
    }
  }, [
    isPermitSupported,
    confirmSwap,
    isPartialApproveEnabledByUser,
    amountToApprove.quotient,
    handleApprove,
    generatePermitToTrade,
  ])

  if (!enablePartialApprove) {
    return (
      <>
        <LegacyApproveButton
          currency={amountToApprove.currency}
          state={approvalState}
          onClick={() => handleApprove(MAX_APPROVE_AMOUNT)}
        />
        {children}
      </>
    )
  }

  const isPending = approvalState === ApprovalState.PENDING

  return (
    <ButtonConfirmed
      disabled={isPending}
      buttonSize={ButtonSize.BIG}
      onClick={approveAndSwap}
      width="100%"
      marginBottom={10}
      altDisabledStyle={isPending}
    >
      <styledEl.ButtonLabelWrapper>
        {label}{' '}
        <HoverTooltip
          wrapInContainer
          content={
            <Trans>
              You must give the CoW Protocol smart contracts permission to use your{' '}
              <TokenSymbol token={amountToApprove.currency} />. If you approve the default amount, you will only have to
              do this once per token.
            </Trans>
          }
        >
          {isPending ? <styledEl.StyledLoader /> : <styledEl.StyledAlert size={24} />}
        </HoverTooltip>
      </styledEl.ButtonLabelWrapper>
    </ButtonConfirmed>
  )
}
