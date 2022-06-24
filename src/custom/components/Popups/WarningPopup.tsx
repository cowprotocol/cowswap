import { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components/macro'

import { ThemedText } from 'theme'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export function WarningPopup({ warning }: { warning: string | JSX.Element }) {
  const theme = useContext(ThemeContext)

  return (
    <RowNoFlex>
      <AutoColumn gap="8px">
        <ThemedText.Body fontWeight={'bold'} color={theme.warningText}>
          {warning}
        </ThemedText.Body>
      </AutoColumn>
    </RowNoFlex>
  )
}
