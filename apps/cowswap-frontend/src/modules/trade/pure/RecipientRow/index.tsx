import { ReactNode } from 'react'

import { areAddressesEqual, isAddress } from '@cowprotocol/common-utils'
import { InfoTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { getChainType } from 'common/chains/nonEvm'
import { ChainAwareAddress } from 'common/pure/ChainAwareAddress'

const Row = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: right;
  gap: 3px;
`

interface RecipientRowProps {
  chainId: number
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
  account: Nullish<string>
}

export function RecipientRow(props: RecipientRowProps): ReactNode {
  const { chainId, recipient, account } = props

  const chainType = getChainType(chainId)
  const recipientAddress =
    chainType === 'evm'
      ? isAddress(recipient)
        ? recipient
        : props.recipientAddress
      : recipient || props.recipientAddress

  const isSameAsAccount =
    chainType === 'evm' && recipientAddress && account ? areAddressesEqual(recipientAddress, account) : false

  if (!recipientAddress || isSameAsAccount) {
    return null
  }

  return (
    <Row>
      <div>
        <span>{chainType === 'evm' ? <Trans>Recipient</Trans> : <Trans>Send to wallet</Trans>}</span>{' '}
        <InfoTooltip
          content={t`The tokens received from this order will automatically be sent to this address. No need to do a second transaction!`}
        />
      </div>
      <div>
        <ChainAwareAddress address={recipientAddress} chainId={chainId} />
      </div>
    </Row>
  )
}
