import { ReactNode } from 'react'

import { areAddressesEqual, isAddress, shortenAddress } from '@cowprotocol/common-utils'

import { Trans } from '@lingui/react/macro'
import { Nullish } from 'types'

import { ExplorerLink } from 'legacy/components/ExplorerLink'

interface ReceiverInfoProps {
  receiver: Nullish<string>
  owner: string
}

export function ReceiverInfo({ receiver, owner }: ReceiverInfoProps): ReactNode {
  const toAddress = receiver && isAddress(receiver) ? shortenAddress(receiver) : receiver

  return (
    <>
      {toAddress && receiver && !areAddressesEqual(receiver, owner) && (
        <div>
          <Trans>Receiver</Trans>: <ExplorerLink id={receiver} label={toAddress} type="address" />
        </div>
      )}
    </>
  )
}
