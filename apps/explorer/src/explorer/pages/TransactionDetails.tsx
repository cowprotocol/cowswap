import React from 'react'

import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'

import { Wrapper } from './styled'

import RedirectToSearch from '../../components/RedirectToSearch'
import { useNetworkId } from '../../state/network'
import { isATxHash } from '../../utils'
import { TransactionsTableWidget } from '../components/TransactionsTableWidget'
import { APP_TITLE } from '../const'

const TransactionDetails: React.FC = () => {
  const { txHash } = useParams<{ txHash: string }>()
  const networkId = useNetworkId() || undefined

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
