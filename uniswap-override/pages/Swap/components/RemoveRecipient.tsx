import { AutoRow } from '@src/components/Row'
import { ArrowWrapper } from 'components/swap/styleds'
import { ArrowDown } from 'react-feather'
import { LinkStyledButton } from '@src/theme'
import { Trans } from '@lingui/macro'
import AddressInputPanel from '@src/components/AddressInputPanel'
import { useContext } from 'react'
import { ThemeContext } from 'styled-components/macro'

export interface RemoveRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
}

export function RemoveRecipient(props: RemoveRecipientProps) {
  const { recipient, onChangeRecipient, className } = props
  const theme = useContext(ThemeContext)

  return (
    <>
      <AutoRow className={className} justify="space-between" style={{ padding: '0 1rem' }}>
        <ArrowWrapper clickable={false}>
          <ArrowDown size="16" color={theme.text2} />
        </ArrowWrapper>
        <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
          <Trans>- Remove recipient</Trans>
        </LinkStyledButton>
      </AutoRow>
      <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
    </>
  )
}
