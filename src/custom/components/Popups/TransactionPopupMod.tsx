import { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { TYPE } from 'theme'
// import { ExternalLink } from 'theme'
// import { getEtherscanLink } from 'utils'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'
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

  const theme = useContext(ThemeContext)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        {!summary || typeof summary === 'string' ? (
          <TYPE.body fontWeight={500} style={{ whiteSpace: 'pre-wrap' }}>
            {summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}
          </TYPE.body>
        ) : (
          summary
        )}
        {chainId && (
          /*   <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
          View on Explorer
        </ExternalLink> */
          <ExplorerLink id={hash} />
        )}
      </AutoColumn>
    </RowNoFlex>
  )
}
