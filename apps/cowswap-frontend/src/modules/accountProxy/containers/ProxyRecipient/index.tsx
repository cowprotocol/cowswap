import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { InfoTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
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
  const proxyAddress = useCurrentAccountProxyAddress()
  const { i18n } = useLingui()
  const accountProxyLabelString = i18n._(ACCOUNT_PROXY_LABEL)

  const targetAddress = bridgeReceiverOverride || proxyAddress

  if (!targetAddress) return

  if (!bridgeReceiverOverride && proxyAddress && recipient && !areAddressesEqual(recipient, proxyAddress)) {
    throw new Error(
      t`Provided proxy address does not match ${accountProxyLabelString} address!, recipient=${recipient}, proxyAddress=${proxyAddress}`,
    )
  }

  return (
    <Wrapper>
      {bridgeReceiverOverride ? (
        <InfoTooltip
          content={
            'This bridge provider uses special receiver address to bridge funds. This address is deterministic for a quote and has been verified by CoW Swap.'
          }
        />
      ) : (
        <Pocket size={size} />
      )}
      <AddressLink address={targetAddress} chainId={chainId} />
    </Wrapper>
  )
}
