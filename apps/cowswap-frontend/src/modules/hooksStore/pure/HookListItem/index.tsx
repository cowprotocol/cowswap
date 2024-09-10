import ICON_INFO from '@cowprotocol/assets/cow-swap/info.svg'
import { Command, HookDapp } from '@cowprotocol/types'

import SVG from 'react-inlinesvg'

import * as styled from './styled'

interface HookListItemProps {
  dapp: HookDapp
  onSelect: Command
  onOpenDetails: Command
}

export function HookListItem({ dapp, onSelect, onOpenDetails }: HookListItemProps) {
  const { name, descriptionShort, image, version } = dapp

  return (
    <styled.HookDappListItem>
      <img src={image} alt={name} />

      <styled.HookDappDetails>
        <h3>{name}</h3>
        <p>
          {descriptionShort}
          <styled.Version>{version}</styled.Version>
        </p>
      </styled.HookDappDetails>
      <span>
        <styled.LinkButton onClick={onSelect} className="link-button">
          Add
        </styled.LinkButton>
        <i onClick={onOpenDetails}>
          <SVG src={ICON_INFO} /> details
        </i>
      </span>
    </styled.HookDappListItem>
  )
}
