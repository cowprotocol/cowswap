import { ReactNode } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { InfoTooltip, NetworkLogo } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ConfirmDetailsItem } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

import { AddressLink } from 'common/pure/AddressLink'

import { RecipientWrapper } from '../../styles'

interface RecipientDetailsItemProps {
  recipient: string
  chainId: number
}

export function RecipientDetailsItem({ recipient, chainId }: RecipientDetailsItemProps): ReactNode {
  return (
    <>
      {!areAddressesEqual(recipient, BRIDGE_QUOTE_ACCOUNT) && isAddress(recipient) && (
        <ConfirmDetailsItem
          withTimelineDot
          label={
            <>
              <Trans>Recipient</Trans>{' '}
              <InfoTooltip content={t`The address that will receive the tokens on the destination chain.`} size={14} />
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
