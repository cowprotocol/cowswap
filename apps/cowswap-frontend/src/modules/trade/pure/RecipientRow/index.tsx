import { ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
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

const Link = styled.a`
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

interface RecipientRowProps {
  chainId: SupportedChainId
  recipient: Nullish<string>
  account: Nullish<string>
}

export function RecipientRow(props: RecipientRowProps) {
  const { chainId, recipient, account } = props
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
            <Link
              title={recipient}
              href={getExplorerLink(chainId, recipient, ExplorerDataType.ADDRESS)}
              target="_blank"
            >
              {isAddress(recipient) ? shortenAddress(recipient) : recipient}
            </Link>
          </div>
        </Row>
      )}
    </>
  )
}
