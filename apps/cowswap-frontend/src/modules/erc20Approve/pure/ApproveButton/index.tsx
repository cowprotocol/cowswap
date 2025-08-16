import { ReactNode, useContext } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary, Loader, TokenSymbol } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { ThemeContext } from 'styled-components/macro'

import * as styledEl from './styledEl'

import { ApprovalState } from '../../hooks'

export interface ApproveButtonProps {
  currency: Currency
  state: ApprovalState
  onClick?: Command
  isDisabled?: boolean
  children?: ReactNode
}

export function ApproveButton(props: ApproveButtonProps): ReactNode {
  const { currency, state, onClick, isDisabled, children } = props

  const theme = useContext(ThemeContext)
  const isPending = state === ApprovalState.PENDING
  const disabled = isDisabled || state !== ApprovalState.NOT_APPROVED

  return (
    <>
      <ButtonPrimary onClick={onClick} disabled={disabled || !onClick}>
        <styledEl.ApproveButtonWrapper isPending={isPending}>
          <TokenLogo token={currency} size={24} />

          <>
            <span>
              <Trans>
                Allow CoW Swap to use your <TokenSymbol token={currency} />
              </Trans>
            </span>
            <span>{isPending && <Loader stroke={theme.text1} />}</span>
          </>
        </styledEl.ApproveButtonWrapper>
      </ButtonPrimary>
      {children}
    </>
  )
}
