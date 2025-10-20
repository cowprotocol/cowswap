import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { areAddressesEqual } from '@cowprotocol/common-utils'

import { Pocket } from 'react-feather'
import styled from 'styled-components/macro'

import { AddressLink } from 'common/pure/AddressLink'

import { useCurrentAccountProxyAddress } from '../../hooks/useCurrentAccountProxy'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;

  > svg {
    margin-top: 3px;
  }
`

interface ProxyRecipientProps {
  recipient: string
  bridgeReceiverOverride: string | null
  chainId: number
  size?: number
}

export function ProxyRecipient({
  recipient,
  bridgeReceiverOverride,
  chainId,
  size = 14,
}: ProxyRecipientProps): ReactNode {
  console.log('[ProxyRecipient] recipient', { recipient, bridgeReceiverOverride })
  const proxyAddress = useCurrentAccountProxyAddress()

  if (!recipient || !(proxyAddress && !bridgeReceiverOverride)) return null

  if (!bridgeReceiverOverride && !areAddressesEqual(recipient, proxyAddress)) {
    throw new Error(
      `Provided proxy address does not match ${ACCOUNT_PROXY_LABEL} address!, recipient=${recipient}, proxyAddress=${proxyAddress}`,
    )
  }

  return (
    <Wrapper>
      <Pocket size={size} />
      <AddressLink address={recipient} chainId={chainId} />
    </Wrapper>
  )
}
