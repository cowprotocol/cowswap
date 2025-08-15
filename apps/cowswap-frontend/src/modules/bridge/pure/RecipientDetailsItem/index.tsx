import { ReactNode } from 'react'

import { InfoTooltip, NetworkLogo } from '@cowprotocol/ui'

import { ConfirmDetailsItem } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

import { AddressLink } from '../../../../common/pure/AddressLink'
import { RecipientWrapper } from '../../styles'

interface RecipientDetailsItemProps {
  recipient: string
  chainId: number
}

export function RecipientDetailsItem({ recipient, chainId }: RecipientDetailsItemProps): ReactNode {
  return (
    <>
      {recipient !== BRIDGE_QUOTE_ACCOUNT && (
        <ConfirmDetailsItem
          withTimelineDot
          label={
            <>
              Recipient{' '}
              <InfoTooltip content="The address that will receive the tokens on the destination chain." size={14} />
            </>
          }
        >
          <RecipientWrapper>
            <NetworkLogo chainId={chainId} size={16} />
            <AddressLink address={recipient} chainId={chainId} />
          </RecipientWrapper>
        </ConfirmDetailsItem>
      )}
    </>
  )
}
