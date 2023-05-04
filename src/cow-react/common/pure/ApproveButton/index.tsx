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
          <CurrencyLogo currency={currency} size={'24px'} style={{ flexShrink: 0 }} />

          {content}
        </span>
      </AutoRow>
    </ButtonConfirmed>
  )
}
