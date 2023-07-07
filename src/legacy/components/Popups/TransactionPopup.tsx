import { useContext } from 'react'

import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { AutoRow } from 'legacy/components/Row'
import { ThemedText } from 'legacy/theme'

import { useIsSafeWallet, useWalletInfo } from 'modules/wallet'

import { HashType } from '../../state/enhancedTransactions/reducer'
import { EnhancedTransactionLink } from '../EnhancedTransactionLink'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export function TransactionPopup({
  hash,
  success,
  summary,
}: {
  hash: string
  success?: boolean
  summary?: string | JSX.Element
}) {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()

  const theme = useContext(ThemeContext)

  if (!account) return null

  const tx = {
    hash,
    hashType: isSafeWallet ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: hash,
      safe: account,
    },
  }

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
        {chainId && <EnhancedTransactionLink chainId={chainId} tx={tx} />}
      </AutoColumn>
    </RowNoFlex>
  )
}
