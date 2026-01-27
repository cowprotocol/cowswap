import { ReactNode } from 'react'

import { areAddressesEqual } from '@cowprotocol/common-utils'
import { InfoTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ConfirmDetailsItem } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

import { getChainType } from 'common/chains/nonEvm'
import { ChainAwareAddress } from 'common/pure/ChainAwareAddress'

import { RecipientWrapper } from '../../styles'

interface RecipientDetailsItemProps {
  recipient: string
  chainId: number
}

export function RecipientDetailsItem({ recipient, chainId }: RecipientDetailsItemProps): ReactNode {
  const chainType = getChainType(chainId)
  const shouldHideBridgeQuoteAccount = chainType === 'evm' && areAddressesEqual(recipient, BRIDGE_QUOTE_ACCOUNT)

  if (shouldHideBridgeQuoteAccount) return null

  return (
    <ConfirmDetailsItem
      withTimelineDot
      label={
        <>
          {chainType === 'evm' ? <Trans>Recipient</Trans> : <Trans>Destination address</Trans>}{' '}
          <InfoTooltip content={t`The address that will receive the tokens on the destination chain.`} size={14} />
        </>
      }
    >
      <RecipientWrapper>
        <ChainAwareAddress address={recipient} chainId={chainId} />
      </RecipientWrapper>
    </ConfirmDetailsItem>
  )
}
