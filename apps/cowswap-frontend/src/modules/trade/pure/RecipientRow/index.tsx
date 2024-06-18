import { isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { InfoTooltip } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

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
  recipient: Nullish<string>
  account: Nullish<string>
}

export function RecipientRow(props: RecipientRowProps) {
  const { recipient, account } = props
  return (
    <>
      {recipient && recipient.toLowerCase() !== account?.toLowerCase() && (
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
            <span title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</span>
          </div>
        </Row>
      )}
    </>
  )
}
