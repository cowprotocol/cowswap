import { ButtonConfirmed } from 'components/Button'
import { AutoRow } from 'components/Row'
import CurrencyLogo from 'components/CurrencyLogo'
import { Trans } from '@lingui/macro'
import Loader from 'components/Loader'
import { CheckCircle, HelpCircle } from 'react-feather'
import { MouseoverTooltip } from 'components/Tooltip'
import { ButtonSize } from 'theme'
import { useContext } from 'react'
import { Currency } from '@uniswap/sdk-core'
import { ThemeContext } from 'styled-components/macro'

export interface ApproveButtonProps {
  currency: Currency | undefined | null

  disabled: boolean
  isPending: boolean
  isConfirmed: boolean
  recentlyApproved: boolean

  onClick: () => Promise<void>
}

// TODO: should be refactored (need to separate context/logic/view)
export function ApproveButton(props: ApproveButtonProps) {
  const { currency, disabled, isPending, isConfirmed, recentlyApproved, onClick } = props

  const theme = useContext(ThemeContext)
  const symbol = currency?.symbol

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
            fontSize: '13px',
          }}
        >
          <CurrencyLogo currency={currency} size={'20px'} style={{ flexShrink: 0 }} />

          {/* we need to shorten this string on mobile */}
          {isConfirmed ? <Trans>You can now trade {symbol}</Trans> : <Trans>Allow CoW Swap to use your {symbol}</Trans>}

          {isPending ? (
            <Loader stroke="white" />
          ) : recentlyApproved ? (
            <CheckCircle size="20" color={theme.green1} />
          ) : (
            <MouseoverTooltip
              text={
                <Trans>
                  You must give the CoW Protocol smart contracts permission to use your {symbol}. You only have to do
                  this once per token.
                </Trans>
              }
            >
              <HelpCircle size="20" color={theme.black} />
            </MouseoverTooltip>
          )}
        </span>
      </AutoRow>
    </ButtonConfirmed>
  )
}
