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

  const handleDetailsClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.link-button')) {
      e.stopPropagation()
      onOpenDetails()
    }
  }

  return (
    <styled.HookDappListItem onClick={handleDetailsClick}>
      <img src={image} alt={name} />

      <styled.HookDappDetails>
        <h3>{name}</h3>
        <p>
          {descriptionShort}
          <styled.Version>{version}</styled.Version>
        </p>
      </styled.HookDappDetails>
      <span>
        <styled.LinkButton onClick={onSelect} className="link-button">Add</styled.LinkButton>
        <i>
          <SVG src={ICON_INFO} /> details
        </i>
      </span>
    </styled.HookDappListItem>
  )
}
