import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import { isATxHash } from '../../utils'
import RedirectToSearch from '../../components/RedirectToSearch'
import { Wrapper } from './styled'
import { useNetworkId } from '../../state/network'
import { TransactionsTableWidget } from '../components/TransactionsTableWidget'
import { APP_TITLE } from '../const'

const TransactionDetails: React.FC = () => {
  const { txHash } = useParams<{ txHash: string }>()
  const networkId = useNetworkId() || undefined

  // TODO: MGR
  if (txHash ? !isATxHash(txHash) : false) {
    return <RedirectToSearch from="tx" />
  }

  return (
    <Wrapper>
      <Helmet>
        <title>Transaction Details - {APP_TITLE}</title>
      </Helmet>
      {txHash && <TransactionsTableWidget txHash={txHash} networkId={networkId} />}
    </Wrapper>
  )
}

export default TransactionDetails
