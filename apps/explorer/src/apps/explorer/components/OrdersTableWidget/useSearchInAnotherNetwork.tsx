import React, { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { abbreviateString } from 'utils'
import { Network } from 'types'
import { NETWORK_ID_SEARCH_LIST } from 'apps/explorer/const'
import { BlockchainNetwork } from './context/OrdersTableContext'
import { Order, getAccountOrders } from 'api/operator'
import CowLoading from 'components/common/CowLoading'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { MEDIA } from 'const'
import { PREFIX_BY_NETWORK_ID } from 'state/network'
import { networkOptions } from 'components/NetworkSelector'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  height: 100%;

  > section {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    p {
      margin-top: 0;
    }
  }

  ul {
    padding: 0;
    margin: 0;
    > li {
      list-style: none;
      padding-bottom: 1.5rem;
      :last-child {
        padding-bottom: 0;
      }
    }
  }
`
const StyledBlockExplorerLink = styled(BlockExplorerLink)`
  margin-top: 1rem;

  @media ${MEDIA.xSmallDown} {
    display: flex;
    justify-content: center;
  }
`
interface OrdersInNetwork {
  network: number
}

interface ResultSearchInAnotherNetwork {
  isLoading: boolean
  ordersInNetworks: OrdersInNetwork[]
  setLoadingState: (value: boolean) => void
  errorMsg: string | null
}

type EmptyMessageProps = ResultSearchInAnotherNetwork & {
  networkId: BlockchainNetwork
  ownerAddress: string
  errorMsg: string | null
}

const _findNetworkName = (networkId: number): string => {
  return networkOptions.find((e) => e.id === networkId)?.name || 'Unknown network'
}

const _buildInternalNetworkUrl = (networkId: number, ownerAddress: string): string => {
  const networkPrefix = PREFIX_BY_NETWORK_ID.get(networkId)

  return `${networkPrefix && '/' + networkPrefix}/address/${ownerAddress}`
}

export const EmptyOrdersMessage = ({
  isLoading,
  networkId,
  ordersInNetworks,
  ownerAddress,
  setLoadingState,
  errorMsg: hasErrorMsg,
}: EmptyMessageProps): JSX.Element => {
  const areOtherNetworks = ordersInNetworks.length > 0

  if (!networkId || isLoading) {
    return <CowLoading />
  }

  return (
    <Wrapper>
      {!areOtherNetworks ? (
        hasErrorMsg ? (
          <p>{hasErrorMsg}</p>
        ) : (
          <p>No orders found.</p>
        )
      ) : (
        <>
          <p>
            No orders found on <strong>{_findNetworkName(networkId)}</strong> for:{' '}
            <StyledBlockExplorerLink
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
                    </Link>
                  </li>
                ))}
              </ul>
            }
          </section>
        </>
      )}
    </Wrapper>
  )
}

export const useSearchInAnotherNetwork = (
  networkId: BlockchainNetwork,
  ownerAddress: string,
  orders: Order[] | undefined,
): ResultSearchInAnotherNetwork => {
  const [ordersInNetworks, setOrdersInNetworks] = useState<OrdersInNetwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isOrdersLengthZero = !orders || orders.length === 0
  const [error, setError] = useState<string | null>(null)

  const fetchAnotherNetworks = useCallback(
    async (_networkId: Network) => {
      setIsLoading(true)
      setError(null)
      const promises = NETWORK_ID_SEARCH_LIST.filter((net) => net !== _networkId).map((network) =>
        getAccountOrders({ networkId: network, owner: ownerAddress, offset: 0, limit: 1 })
          .then((response) => {
            if (!response.orders.length) return

            return { network }
          })
          .catch((e) => {
            // Msg for when there are no orders on any network and a request has failed
            setError('An error has occurred while requesting the data.')
            console.error(`Failed to fetch order in ${Network[network]}`, e)
          }),
      )

      const networksHaveOrders = (await Promise.allSettled(promises)).filter(
        (e) => e.status === 'fulfilled' && e.value?.network,
      )
      setOrdersInNetworks(networksHaveOrders.map((e: PromiseFulfilledResult<OrdersInNetwork>) => e.value))
      setIsLoading(false)
    },
    [ownerAddress],
  )

  useEffect(() => {
    if (!networkId || !isOrdersLengthZero) return

    fetchAnotherNetworks(networkId)
  }, [fetchAnotherNetworks, isOrdersLengthZero, networkId])

  return { isLoading, ordersInNetworks, setLoadingState: setIsLoading, errorMsg: error }
}
