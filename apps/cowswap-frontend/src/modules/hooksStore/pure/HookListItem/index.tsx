import ICON_INFO from '@cowprotocol/assets/cow-swap/info.svg'
import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
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
  const { i18n } = useLingui()
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

  const dAppName = i18n._(name)

  return (
    <styled.HookDappListItem
      onClick={handleItemClick}
      isCompatible={isCompatible}
      data-incompatibility-text={t`This hook is not compatible with your wallet`}
    >
      <img src={image} alt={dAppName} />

      <styled.HookDappDetails onClick={onOpenDetails}>
        <h3>{dAppName}</h3>
        <p>
          {descriptionShort ? i18n._(descriptionShort) : ''}
          <styled.Version>{version}</styled.Version>
        </p>
      </styled.HookDappDetails>
      <span>
        {isCompatible ? (
          <styled.LinkButton onClick={onSelect} className="link-button">
            <Trans>Open</Trans>
          </styled.LinkButton>
        ) : (
          <styled.LinkButton disabled title={t`Not compatible with current wallet type`}>
            <Trans>N/A</Trans>
          </styled.LinkButton>
        )}
        {onRemove ? (
          <styled.RemoveButton onClick={onRemove} className="remove-button">
            <Trans>Remove</Trans>
          </styled.RemoveButton>
        ) : null}
        <i
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetails()
          }}
        >
          <SVG src={ICON_INFO} /> <Trans>details</Trans>
        </i>
      </span>
    </styled.HookDappListItem>
  )
}
