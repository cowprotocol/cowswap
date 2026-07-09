import { ReactElement } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'

import { Link } from 'react-router'

export function OwnerLink({ address }: { address: string }): ReactElement {
  return (
    <Link to={`/address/${address}`} title={address}>
      {shortenAddress(address)}↗
    </Link>
  )
}
