import { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components/macro'

import { ThemedText } from 'legacy/theme'
import { AutoColumn } from 'legacy/components/Column'
import { AutoRow } from 'legacy/components/Row'
import { AlertCircle } from 'react-feather'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export function WarningPopup({ warning }: { warning: string | JSX.Element }) {
  const theme = useContext(ThemeContext)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        <AlertCircle color={theme.red1} size={24} />
      </div>
      <AutoColumn gap="sm">
        <ThemedText.Body fontWeight={'bold'} color={theme.danger}>
          {warning}
        </ThemedText.Body>
      </AutoColumn>
    </RowNoFlex>
  )
}
