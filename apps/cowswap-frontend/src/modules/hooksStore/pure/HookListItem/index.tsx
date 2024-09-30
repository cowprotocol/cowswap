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

  const handleItemClick = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.target as HTMLElement
    // Check if the click target is not a button or the info icon
    if (!target.closest('.link-button') && !target.closest('.remove-button') && !target.closest('i')) {
      onOpenDetails()
    }
  }

  return (
    <styled.HookDappListItem onClick={handleItemClick}>
      <img src={image} alt={name} />

      <styled.HookDappDetails onClick={onOpenDetails}>
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
        {onRemove ? (
          <styled.RemoveButton onClick={onRemove} className="remove-button">
            Remove
          </styled.RemoveButton>
        ) : null}
        <i
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetails()
          }}
        >
          <SVG src={ICON_INFO} /> details
        </i>
      </span>
    </styled.HookDappListItem>
  )
}
