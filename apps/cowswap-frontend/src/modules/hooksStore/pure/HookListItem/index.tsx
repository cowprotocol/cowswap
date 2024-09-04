import { HookDapp } from '@cowprotocol/types'

import { HookDappDetails, HookDappListItem, Link, Version } from './styled'

export function HookListItem({ dapp, onSelect }: { dapp: HookDapp; onSelect: (dapp: HookDapp) => void }) {
  const { name, description, image, version } = dapp

  return (
    <HookDappListItem>
      <div>
        <img onClick={() => onSelect(dapp)} src={image} alt={name} />
      </div>
      <HookDappDetails>
        <h3>{name}</h3>
        <p>{description}</p>
        <Link onClick={() => onSelect(dapp)}>+ Add hook</Link>

        <Version>{version}</Version>
      </HookDappDetails>
    </HookDappListItem>
  )
}
