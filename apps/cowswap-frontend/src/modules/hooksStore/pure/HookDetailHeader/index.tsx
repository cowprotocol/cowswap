import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'

import * as styled from './styled'

import { HookDapp } from '../../types/hooks'
import { isHookCompatible } from '../../utils'

interface HookDetailHeaderProps {
  dapp: HookDapp
  walletType: HookDappWalletCompatibility
  onSelect?: () => void
  iconSize?: number
  gap?: number
  padding?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HookDetailHeader({ dapp, walletType, onSelect, iconSize, gap, padding }: HookDetailHeaderProps) {
  const { name, image, descriptionShort } = dapp
  const isCompatible = isHookCompatible(dapp, walletType)

  return (
    <styled.Header iconSize={iconSize} gap={gap} padding={padding}>
      <img src={image} alt={name} />
      <styled.Content>
        <h3>{name}</h3>
        <styled.Description>{descriptionShort}</styled.Description>
        {onSelect &&
          (isCompatible ? (
            <styled.AddButton onClick={onSelect}>Add</styled.AddButton>
          ) : (
            <styled.AddButton disabled title="Not compatible with current wallet type">
              n/a
            </styled.AddButton>
          ))}
      </styled.Content>
    </styled.Header>
  )
}
