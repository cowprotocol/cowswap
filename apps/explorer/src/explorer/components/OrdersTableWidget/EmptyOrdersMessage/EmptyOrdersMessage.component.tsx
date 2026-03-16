import { CHAIN_INFO, getChainInfo } from '@cowprotocol/common-const'
import { isChainDeprecated, SupportedChainId } from '@cowprotocol/cow-sdk'

import { Link } from 'react-router'

import * as styledEl from './EmptyOrdersMessage.styled'

import CowLoading from '../../../../components/common/CowLoading'
import { abbreviateString } from '../../../../utils'
import { BlockchainNetwork } from '../context/OrdersTableContext'
import { ResultSearchInAnotherNetwork } from '../useSearchInAnotherNetwork'

interface EmptyMessageProps extends ResultSearchInAnotherNetwork {
  networkId: BlockchainNetwork
  ownerAddress: string
  errorMsg: string | null
}

const _findNetworkName = (networkId: number): string => {
  return getChainInfo(networkId).label || 'Unknown network'
}

const _buildInternalNetworkUrl = (networkId: number, ownerAddress: string): string => {
  const networkPrefix = CHAIN_INFO[networkId as SupportedChainId].urlAlias

  return `${networkPrefix && '/' + networkPrefix}/address/${ownerAddress}`
}

export const EmptyOrdersMessage = ({
  isLoading,
  networkId,
  ordersInNetworks,
  ownerAddress,
  setLoadingState,
  errorMsg: hasErrorMsg,
}: EmptyMessageProps): React.ReactNode => {
  const areOtherNetworks = ordersInNetworks.length > 0

  if (!networkId || isLoading) {
    return <CowLoading />
  }

  return (
    <styledEl.Wrapper>
      {!areOtherNetworks ? (
        hasErrorMsg ? (
          <p>{hasErrorMsg}</p>
        ) : (
          <p>No orders found.</p>
        )
      ) : (
        <>
          <p>
            No orders found on{' '}
            <strong>
              {_findNetworkName(networkId)}
              {isChainDeprecated(networkId) ? ' (deprecated)' : ''}
            </strong>{' '}
            for:{' '}
            <styledEl.StyledBlockExplorerLink
              identifier={ownerAddress}
              type="address"
              label={abbreviateString(ownerAddress, 4, 4)}
              networkId={networkId}
            />
          </p>
          <section>
            {' '}
            <p>However, found orders on:</p>
            {
              <ul>
                {ordersInNetworks.map((e) => (
                  <li key={e.network}>
                    <Link
                      to={_buildInternalNetworkUrl(e.network, ownerAddress)}
                      onClick={(): void => setLoadingState(true)}
                    >
                      {_findNetworkName(e.network)}
                      {isChainDeprecated(e.network) ? ' (deprecated)' : ''}
                    </Link>
                  </li>
                ))}
              </ul>
            }
          </section>
        </>
      )}
    </styledEl.Wrapper>
  )
}
