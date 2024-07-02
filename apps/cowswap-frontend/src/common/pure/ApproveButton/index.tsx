import { useContext, useMemo } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { ButtonSize, Loader, TokenSymbol, AutoRow, ButtonConfirmed, HoverTooltip } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { CheckCircle, HelpCircle } from 'react-feather'
import { ThemeContext } from 'styled-components/macro'

import { ApprovalState } from '../../hooks/useApproveState'

export interface ApproveButtonProps {
  currency: Currency | undefined | null
  state: ApprovalState
  onClick: Command
  isDisabled?: boolean
}

export function ApproveButton(props: ApproveButtonProps) {
  const { currency, state, onClick, isDisabled } = props

  const theme = useContext(ThemeContext)
  const isPending = state === ApprovalState.PENDING
  const isConfirmed = state === ApprovalState.APPROVED
  const disabled = isDisabled || state !== ApprovalState.NOT_APPROVED

  const content = useMemo(() => {
    if (isConfirmed) {
      return (
        <>
          <Trans>
            You can now trade <TokenSymbol token={currency} />
          </Trans>
          <CheckCircle size="24" />
        </>
      )
    } else {
      return (
        <>
          {/* we need to shorten this string on mobile */}
          <span>
            <Trans>
              Allow CoW Swap to use your <TokenSymbol token={currency} />
            </Trans>
          </span>
          <HoverTooltip wrapInContainer 
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
      )
    }
  }, [currency, theme, isPending, isConfirmed])

  return (
    <ButtonConfirmed
      buttonSize={ButtonSize.BIG}
      onClick={onClick}
      disabled={disabled}
      width="100%"
      marginBottom={10}
      altDisabledStyle={isPending} // show solid button while waiting
      confirmed={isConfirmed}
    >
      <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            width: '100%',
            fontSize: '14px',
          }}
        >
          <TokenLogo token={currency} size={24} />

          {content}
        </span>
      </AutoRow>
    </ButtonConfirmed>
  )
}
