import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { areAddressesEqual } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'
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
  chainId: number
  size?: number
}

export function ProxyRecipient({ recipient, chainId, size = 14 }: ProxyRecipientProps): ReactNode {
  const proxyAddress = useCurrentAccountProxyAddress()

  if (!recipient || !proxyAddress) return null

  if (!areAddressesEqual(recipient, proxyAddress)) {
    throw new Error(
      t`Provided proxy address does not match ${ACCOUNT_PROXY_LABEL} address!, recipient=${recipient}, proxyAddress=${proxyAddress}`,
    )
  }

  return (
    <Wrapper>
      <Pocket size={size} />
      <AddressLink address={proxyAddress} chainId={chainId} />
    </Wrapper>
  )
}
