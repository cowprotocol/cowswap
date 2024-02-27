import { isAddress, shortenAddress } from '@cowprotocol/common-utils'

import { Nullish } from 'types'

import { ExplorerLink } from 'legacy/components/ExplorerLink'

interface ReceiverInfoProps {
  receiver: Nullish<string>
  owner: string
}

export function ReceiverInfo({ receiver, owner }: ReceiverInfoProps) {
  const toAddress = receiver && isAddress(receiver) ? shortenAddress(receiver) : receiver

  return (
    <>
      {toAddress && receiver && receiver !== owner && (
        <div>
          Receiver: <ExplorerLink id={receiver} label={toAddress} type="address" />
        </div>
      )}
    </>
  )
}
