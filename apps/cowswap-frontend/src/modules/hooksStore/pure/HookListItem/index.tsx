import ICON_INFO from '@cowprotocol/assets/cow-swap/info.svg'
import { Command } from '@cowprotocol/types'

import SVG from 'react-inlinesvg'

import * as styled from './styled'

import { HookDapp } from '../../types/hooks'

interface HookListItemProps {
  dapp: HookDapp
  onSelect: Command
  onOpenDetails: Command
  onRemove?: Command
}

export function HookListItem({ dapp, onSelect, onOpenDetails, onRemove }: HookListItemProps) {
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
        {onRemove ? <styled.RemoveButton onClick={onRemove}>Remove</styled.RemoveButton> : null}
        <i onClick={onOpenDetails}>
          <SVG src={ICON_INFO} /> details
        </i>
      </span>
    </styled.HookDappListItem>
  )
}
