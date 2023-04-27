import { AutoRow } from 'components/Row'
import { ArrowWrapper } from 'components/swap/styleds'
import { ArrowDown } from 'react-feather'
import { AddressInputPanel } from 'components/AddressInputPanel'
import { useContext } from 'react'
import { ThemeContext } from 'styled-components/macro'
export interface SetRecipientProps {
  recipient: string
  onChangeRecipient(recipient: string | null): void
  className?: string
}

export function SetRecipient(props: SetRecipientProps) {
  const { recipient, onChangeRecipient, className } = props
  const theme = useContext(ThemeContext)

  return (
    <>
      <AutoRow className={className} justify="space-between" style={{ padding: '0 rem', margin: '1rem 0' }}>
        <ArrowWrapper clickable={false}>
          <ArrowDown size="16" color={theme.text2} />
        </ArrowWrapper>
      </AutoRow>
      <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
    </>
  )
}
