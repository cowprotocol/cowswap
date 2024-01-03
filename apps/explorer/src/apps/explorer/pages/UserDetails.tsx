import React from 'react'
import { useParams } from 'react-router'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'

import OrdersTableWidget from '../components/OrdersTableWidget'
import { useNetworkId } from 'state/network'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import RedirectToSearch from 'components/RedirectToSearch'
import { useResolveEns } from 'hooks/useResolveEns'
import { TitleAddress, Wrapper as WrapperMod, FlexContainerVar } from 'apps/explorer/pages/styled'
import CowLoading from 'components/common/CowLoading'
import { APP_TITLE } from 'apps/explorer/const'

const Wrapper = styled(WrapperMod)`
  > h1 {
    padding: 2.4rem 0 0.75rem;
  }
`

const UserDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>()
  const networkId = useNetworkId() || undefined
  const addressAccount = useResolveEns(address)

  if (addressAccount?.address === null) {
    return <RedirectToSearch from="address" />
  }

  return (
    <Wrapper>
      <Helmet>
        <title>User Details - {APP_TITLE}</title>
      </Helmet>
      {addressAccount ? (
        <>
          <FlexContainerVar>
            <h1>User details</h1>
            <TitleAddress
              textToCopy={addressAccount.address}
              contentsToDisplay={
                <BlockExplorerLink
                  showLogo
                  type="address"
                  networkId={networkId}
                  identifier={address}
                  label={addressAccount.ens}
                />
              }
            />
          </FlexContainerVar>
          <OrdersTableWidget ownerAddress={addressAccount.address} networkId={networkId} />
        </>
      ) : (
        <CowLoading />
      )}
    </Wrapper>
  )
}

export default UserDetails
