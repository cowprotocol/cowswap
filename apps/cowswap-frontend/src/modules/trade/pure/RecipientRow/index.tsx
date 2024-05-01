import React from 'react'

import { isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { InfoTooltip } from '@cowprotocol/ui'

import styled from 'styled-components/macro'


const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: right;
  min-height: 24px;
  gap: 3px;
`

interface RecipientRowProps {
  recipient: string | null
  recipientAddressOrName: string | null
  account: string | undefined
}

export function RecipientRow(props: RecipientRowProps) {
  const { recipientAddressOrName, recipient, account } = props
  return (
    <>
      {recipientAddressOrName && recipient !== account && (
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
            <span title={recipientAddressOrName}>
              {isAddress(recipientAddressOrName) ? shortenAddress(recipientAddressOrName) : recipientAddressOrName}
            </span>
          </div>
        </Row>
      )}
    </>
  )
}
