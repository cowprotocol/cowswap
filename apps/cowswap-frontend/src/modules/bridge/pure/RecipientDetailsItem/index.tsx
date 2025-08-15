import { ReactNode } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { InfoTooltip } from '@cowprotocol/ui'

import { ConfirmDetailsItem } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

import { RecipientDisplay } from '../RecipientDisplay'

interface RecipientDetailsItemProps {
  recipient: string
  chainId: number
}

export function RecipientDetailsItem({ recipient, chainId }: RecipientDetailsItemProps): ReactNode {
  return (
    <>
      {recipient !== BRIDGE_QUOTE_ACCOUNT && isAddress(recipient) && (
        <ConfirmDetailsItem
          withTimelineDot
          label={
            <>
              Recipient{' '}
              <InfoTooltip content="The address that will receive the tokens on the destination chain." size={14} />
            </>
          }
        >
          <RecipientDisplay recipient={recipient} chainId={chainId} logoSize={16} />
        </ConfirmDetailsItem>
      )}
    </>
  )
}
