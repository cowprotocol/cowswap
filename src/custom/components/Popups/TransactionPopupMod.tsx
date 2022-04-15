import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'

// import { useTransaction } from 'state/transactions/hooks'
import { ThemedText } from 'theme'
// import { ExternalLink } from 'theme'
// import { ExplorerDataType, getEtherscanLink } from 'utils'
// import { TransactionSummary } from '../AccountDetails/TransactionSummary'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'

// MOD imports
import { ExplorerLink } from 'components/ExplorerLink'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function TransactionPopup({
  hash,
  success,
  summary,
}: {
  hash: string
  success?: boolean
  summary?: string | JSX.Element
}) {
  const { chainId } = useActiveWeb3React()

  // const tx = useTransaction(hash)
  const theme = useContext(ThemeContext)

  // if (!tx) return null
  // const success = Boolean(tx.receipt && tx.receipt.status === 1)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        {/* <ThemedText.Body fontWeight={500}>
          <TransactionSummary info={tx.info} />
        </ThemedText.Body> */}
        {!summary || typeof summary === 'string' ? (
          <ThemedText.Body fontWeight={500} style={{ whiteSpace: 'pre-wrap' }}>
            {summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}
          </ThemedText.Body>
        ) : (
          summary
        )}
        {chainId && (
          /* <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
            View on Explorer
          </ExternalLink> */
          <ExplorerLink id={hash} />
        )}
      </AutoColumn>
    </RowNoFlex>
  )
}
