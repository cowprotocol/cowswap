import { HookDapp } from '@cowprotocol/types'

import * as styled from './styled'

interface HookDetailHeaderProps {
  dapp: HookDapp
  onSelect?: () => void
  iconSize?: number
  gap?: number
  padding?: string
}

export function HookDetailHeader({ dapp, onSelect, iconSize, gap, padding }: HookDetailHeaderProps) {
  const { name, image, descriptionShort } = dapp

  return (
    <styled.Header iconSize={iconSize} gap={gap} padding={padding}>
      <img src={image} alt={name} />
      <styled.Content>
        <h3>{name}</h3>
        <styled.Description>{descriptionShort}</styled.Description>
        {onSelect && <styled.AddButton onClick={onSelect}>Add</styled.AddButton>}
      </styled.Content>
    </styled.Header>
  )
}