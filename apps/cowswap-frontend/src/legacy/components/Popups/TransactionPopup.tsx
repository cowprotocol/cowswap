import { useContext } from 'react'

import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { ExplorerLink } from 'legacy/components/ExplorerLink'
import { AutoRow } from 'legacy/components/Row'
import { ThemedText } from 'legacy/theme'
import { BlockExplorerLinkType } from 'legacy/utils'

import { useWalletInfo } from 'modules/wallet'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export function TransactionPopup({
  hash,
  success,
  type = 'transaction',
  summary,
}: {
  hash: string
  success?: boolean
  summary?: string | JSX.Element
  type?: BlockExplorerLinkType
}) {
  const { chainId } = useWalletInfo()

  const theme = useContext(ThemeContext)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        {!summary || typeof summary === 'string' ? (
          <ThemedText.Body fontWeight={500} style={{ whiteSpace: 'pre-wrap' }}>
            {summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}
          </ThemedText.Body>
        ) : (
          summary
        )}
        {chainId && <ExplorerLink id={hash} type={type} />}
      </AutoColumn>
    </RowNoFlex>
  )
}
