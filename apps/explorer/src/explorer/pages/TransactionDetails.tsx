import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'

import { Wrapper, StyledSearch } from './styled'

import RedirectToSearch from '../../components/RedirectToSearch'
import { useNetworkId } from '../../state/network'
import { isATxHash } from '../../utils'
import { TransactionsTableWidget } from '../components/TransactionsTableWidget'
import { APP_TITLE } from '../const'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const TransactionDetails = () => {
  const { txHash } = useParams<{ txHash: string }>()
  const networkId = useNetworkId() ?? undefined

  if (txHash ? !isATxHash(txHash) : false) {
    return <RedirectToSearch from="tx" />
  }

  const txHashWithOx = !txHash || txHash.startsWith('0x') ? txHash : `0x${txHash}`

  return (
    <Wrapper>
      <Helmet>
        <title>Transaction Details - {APP_TITLE}</title>
      </Helmet>
      <StyledSearch />
      {txHashWithOx && <TransactionsTableWidget txHash={txHashWithOx} networkId={networkId} />}
    </Wrapper>
  )
}

export default TransactionDetails
