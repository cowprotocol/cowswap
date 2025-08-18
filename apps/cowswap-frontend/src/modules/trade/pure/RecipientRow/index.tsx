import { ReactNode } from 'react'

import { areAddressesEqual, isAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { AddressLink } from 'common/pure/AddressLink'

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
  chainId: SupportedChainId
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
  account: Nullish<string>
}

export function RecipientRow(props: RecipientRowProps): ReactNode {
  const { chainId, recipient, account } = props

  const recipientAddress = isAddress(recipient) ? recipient : props.recipientAddress

  if (!recipient || !recipientAddress || areAddressesEqual(recipientAddress, account)) {
    return null
  }

  return (
    <Row>
      <div>
        <span>Recipient</span>{' '}
        <InfoTooltip
          content={
            'The tokens received from this order will automatically be sent to this address. No need to do a second transaction!'
          }
        />
      </div>
      <div>
        <AddressLink address={recipientAddress} content={recipient} chainId={chainId} />
      </div>
    </Row>
  )
}
