import { ReactNode } from 'react'

import { isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/react/macro'
import { Nullish } from 'types'

import { ExplorerLink } from 'legacy/components/ExplorerLink'

interface ReceiverInfoProps {
  receiver: Nullish<string>
  owner: string
  customPrefix?: ReactNode
}

export function ReceiverInfo({ receiver, owner, customPrefix }: ReceiverInfoProps): ReactNode {
  const toAddress = receiver && isAddress(receiver) ? shortenAddress(receiver) : receiver

  return (
    <>
      {toAddress && receiver && !areAddressesEqual(receiver, owner) && (
        <div>
          {customPrefix ? (
            customPrefix
          ) : (
            <>
              <Trans>Receiver</Trans>:
            </>
          )}{' '}
          <ExplorerLink id={receiver} label={toAddress} type="address" />
        </div>
      )}
    </>
  )
}
