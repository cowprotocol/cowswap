import ICON_INFO from '@cowprotocol/assets/cow-swap/info.svg'
import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { Command } from '@cowprotocol/types'

import SVG from 'react-inlinesvg'

import * as styled from './styled'

import { HookDapp } from '../../types/hooks'
import { isHookCompatible } from '../../utils'

interface HookListItemProps {
  dapp: HookDapp
  walletType: HookDappWalletCompatibility
  onSelect: Command
  onOpenDetails: Command
  onRemove?: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HookListItem({ dapp, walletType, onSelect, onOpenDetails, onRemove }: HookListItemProps) {
  const { name, descriptionShort, image, version } = dapp

  const isCompatible = isHookCompatible(dapp, walletType)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleItemClick = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.target as HTMLElement
    // Check if the click target is not a button or the info icon
    if (!target.closest('.link-button') && !target.closest('.remove-button') && !target.closest('i')) {
      onOpenDetails()
    }
  }

  return (
    <styled.HookDappListItem onClick={handleItemClick} isCompatible={isCompatible}>
      <img src={image} alt={name} />

      <styled.HookDappDetails onClick={onOpenDetails}>
        <h3>{name}</h3>
        <p>
          {descriptionShort}
          <styled.Version>{version}</styled.Version>
        </p>
      </styled.HookDappDetails>
      <span>
        {isCompatible ? (
          <styled.LinkButton onClick={onSelect} className="link-button">
            Open
          </styled.LinkButton>
        ) : (
          <styled.LinkButton disabled title="Not compatible with current wallet type">
            n/a
          </styled.LinkButton>
        )}
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
