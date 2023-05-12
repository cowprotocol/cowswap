import { ButtonConfirmed } from 'components/Button'
import { AutoRow } from 'components/Row'
import CurrencyLogo from 'components/CurrencyLogo'
import { Trans } from '@lingui/macro'
import Loader from 'components/Loader'
import { CheckCircle, HelpCircle } from 'react-feather'
import { MouseoverTooltip } from 'components/Tooltip'
import { ButtonSize } from 'theme/enum'
import { useContext, useMemo } from 'react'
import { Currency } from '@uniswap/sdk-core'
import { ThemeContext } from 'styled-components/macro'
import { ApprovalState } from 'hooks/useApproveCallback'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'

export interface ApproveButtonProps {
  currency: Currency | undefined | null
  state: ApprovalState
  onClick: () => void
}

export function ApproveButton(props: ApproveButtonProps) {
  const { currency, state, onClick } = props

  const theme = useContext(ThemeContext)
  const isPending = state === ApprovalState.PENDING
  const isConfirmed = state === ApprovalState.APPROVED
  const disabled = state !== ApprovalState.NOT_APPROVED
  const needsToSetApprovalToZero = state === ApprovalState.NOT_APPROVED_NEEDS_TO_SET_TO_ZERO

  const content = useMemo(() => {
    if (isConfirmed) {
      return (
        <>
          <Trans>
            You can now trade <TokenSymbol token={currency} />
          </Trans>
          <CheckCircle size="24" color={theme.text1} />
        </>
      )
    } else if (needsToSetApprovalToZero) {
      return (
        <>
          <span>
            <Trans>
              Unfortunatelly <TokenSymbol token={currency} /> token implementation requires you to disapprove it in
              order to be able to use it. To avoid this, make sure you use the <strong>default allowance</strong> when
              you sign it in the wallet
            </Trans>
          </span>
          <MouseoverTooltip
            text={
              <Trans>
                Tokens such as <TokenSymbol token={currency} /> don't allow to set the allowance to a non-zero amount
                when you have a previous allowance (non-zero allowance). We understand how annoying this is, but this is
                just a help this Dapp provides to overcome this limitation from <TokenSymbol token={currency} />{' '}
                implementation, if you don't remove the allowance before you set the new one, the contract will revert,
                and you will pay gas for nothing.
              </Trans>
            }
          >
            {isPending ? <Loader stroke={theme.text1} /> : <HelpCircle size="24" color={theme.white} />}
          </MouseoverTooltip>
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
          <MouseoverTooltip
            text={
              <Trans>
                You must give the CoW Protocol smart contracts permission to use your <TokenSymbol token={currency} />.
                If you approve the default amount, you will only have to do this once per token.
              </Trans>
            }
          >
            {isPending ? <Loader stroke={theme.text1} /> : <HelpCircle size="24" color={theme.white} />}
          </MouseoverTooltip>
        </>
      )
    }
  }, [currency, theme, isPending, isConfirmed, needsToSetApprovalToZero])

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
          <CurrencyLogo currency={currency} size={'24px'} style={{ flexShrink: 0 }} />

          {content}
        </span>
      </AutoRow>
    </ButtonConfirmed>
  )
}
