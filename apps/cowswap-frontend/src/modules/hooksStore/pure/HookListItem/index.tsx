import ICON_INFO from '@cowprotocol/assets/cow-swap/info.svg'
import { Command } from '@cowprotocol/types'
import { TruncatedText } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import * as styled from './styled'

import { HookDapp } from '../../types/hooks'

interface HookListItemProps {
  dapp: HookDapp
  onSelect: Command
  onOpenDetails: Command
}

export function HookListItem({ dapp, onSelect, onOpenDetails }: HookListItemProps) {
  const { name, description, image, version } = dapp

  return (
    <styled.HookDappListItem>
      <img src={image} alt={name} />

      <styled.HookDappDetails>
        <h3>{name}</h3>
        <p>
          <TruncatedText width="24ch">{description}</TruncatedText> <styled.Version>{version}</styled.Version>
        </p>
      </styled.HookDappDetails>
      <span>
        <styled.LinkButton onClick={onSelect}>Add</styled.LinkButton>
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
