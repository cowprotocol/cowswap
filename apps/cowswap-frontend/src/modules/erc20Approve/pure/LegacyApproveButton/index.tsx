import { ReactNode, useContext, useMemo } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { AutoRow, ButtonConfirmed, ButtonSize, HoverTooltip, Loader, TokenSymbol } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'
import { CheckCircle, HelpCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'

import { ApprovalState } from '../../types'
import { ApprovalTooltip } from '../ApprovalTooltip'

const ApproveButtonContentWrapper = styled.span`
  padding: 0 3px;
`

const TokenLogoContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  font-size: 14px;
`

export interface ApproveButtonProps {
  currency: Currency | undefined | null
  state: ApprovalState
  onClick?: Command
  isDisabled?: boolean
}

export function LegacyApproveButton(props: ApproveButtonProps): ReactNode {
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
      if (!currency) return null

      return (
        <>
          {/* we need to shorten this string on mobile */}
          <ApproveButtonContentWrapper>
            <Trans>
              Allow CoW Swap to use your <TokenSymbol token={currency} />
            </Trans>
          </ApproveButtonContentWrapper>
          <HoverTooltip wrapInContainer content={<ApprovalTooltip currency={currency} isLegacyApproval={true} />}>
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
      disabled={disabled || !onClick}
      width="100%"
      marginBottom={10}
      altDisabledStyle={isPending} // show solid button while waiting
      confirmed={isConfirmed}
    >
      <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
        <TokenLogoContainer>
          <TokenLogo token={currency} size={24} />
          {content}
        </TokenLogoContainer>
      </AutoRow>
    </ButtonConfirmed>
  )
}
