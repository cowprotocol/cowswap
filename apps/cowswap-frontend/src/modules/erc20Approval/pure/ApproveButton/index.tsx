import { useContext } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary, ButtonSize, HoverTooltip, Loader, TokenSymbol } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { HelpCircle } from 'react-feather'
import { ThemeContext } from 'styled-components/macro'

import * as styledEl from './styledEl'

import { ApprovalState } from '../../hooks/useApproveState'

export interface ApproveButtonProps {
  currency: Currency | undefined | null
  state: ApprovalState
  onClick?: Command
  isDisabled?: boolean
}

export function ApproveButton(props: ApproveButtonProps) {
  const { currency, state, onClick, isDisabled } = props

  const theme = useContext(ThemeContext)
  const isPending = state === ApprovalState.PENDING
  const disabled = isDisabled || state !== ApprovalState.NOT_APPROVED

  return (
    <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onClick} disabled={disabled || !onClick}>
      <styledEl.ApproveButtonWrapper isPending={isPending}>
        <TokenLogo token={currency} size={24} />

        <>
          {/* we need to shorten this string on mobile */}
          <span>
            <Trans>
              Allow CoW Swap to use your <TokenSymbol token={currency} />
            </Trans>
          </span>
          <HoverTooltip
            wrapInContainer
            content={
              <Trans>
                You must give the CoW Protocol smart contracts permission to use your <TokenSymbol token={currency} />.
                If you approve the default amount, you will only have to do this once per token.
              </Trans>
            }
          >
            {isPending ? <Loader stroke={theme.text1} /> : <HelpCircle size="24" />}
          </HoverTooltip>
        </>
      </styledEl.ApproveButtonWrapper>
    </ButtonPrimary>
  )
}
