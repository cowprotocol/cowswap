import { useCallback, useEffect, useMemo, useState } from 'react'

import { CHAIN_INFO, getChainInfo } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { BlockchainNetwork } from './context/OrdersTableContext'

import { getAccountOrders, Order } from '../../../api/operator'
import { BlockExplorerLink } from '../../../components/common/BlockExplorerLink'
import CowLoading from '../../../components/common/CowLoading'
import { MEDIA } from '../../../const'
import { Network } from '../../../types'
import { abbreviateString } from '../../../utils'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 2.4rem;

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
      text-align: center;

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
  return getChainInfo(networkId).label || 'Unknown network'
}

const _buildInternalNetworkUrl = (networkId: number, ownerAddress: string): string => {
  const networkPrefix = CHAIN_INFO[networkId as SupportedChainId].urlAlias

  return `${networkPrefix && '/' + networkPrefix}/address/${ownerAddress}`
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
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
  orders: Order[] | undefined
): ResultSearchInAnotherNetwork => {
  const [ordersInNetworks, setOrdersInNetworks] = useState<OrdersInNetwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isOrdersLengthZero = !orders || orders.length === 0
  const [error, setError] = useState<string | null>(null)
  const availableChains = useAvailableChains()

  const fetchAnotherNetworks = useCallback(
    async (_networkId: Network) => {
      setIsLoading(true)
      setError(null)
      const promises = availableChains
        .filter((net) => net !== _networkId)
        .map((network) =>
          getAccountOrders({ networkId: network, owner: ownerAddress, offset: 0, limit: 1 })
            .then((response) => {
              if (!response.orders.length) return

              return { network }
            })
            .catch((e) => {
              // Msg for when there are no orders on any network and a request has failed
              setError('An error has occurred while requesting the data.')
              console.error(`Failed to fetch order in ${Network[network]}`, e)
            })
        )

      const networksHaveOrders = (await Promise.allSettled(promises)).filter(
        (e) => e.status === 'fulfilled' && e.value?.network
      )
      setOrdersInNetworks(networksHaveOrders.map((e) => (e.status === 'fulfilled' ? e.value : e.reason)))
      setIsLoading(false)
    },
    [ownerAddress, availableChains]
  )

  useEffect(() => {
    if (!networkId || !isOrdersLengthZero) return

    fetchAnotherNetworks(networkId)
  }, [fetchAnotherNetworks, isOrdersLengthZero, networkId])

  return useMemo(
    () => ({ isLoading, ordersInNetworks, setLoadingState: setIsLoading, errorMsg: error }),
    [isLoading, ordersInNetworks, setIsLoading, error]
  )
}
