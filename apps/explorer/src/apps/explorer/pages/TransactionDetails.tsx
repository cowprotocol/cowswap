import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'

import { isATxHash } from 'utils'
import RedirectToSearch from 'components/RedirectToSearch'
import { Wrapper } from 'apps/explorer/pages/styled'
import { useNetworkId } from 'state/network'
import { TransactionsTableWidget } from 'apps/explorer/components/TransactionsTableWidget'
import { APP_TITLE } from 'apps/explorer/const'

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
