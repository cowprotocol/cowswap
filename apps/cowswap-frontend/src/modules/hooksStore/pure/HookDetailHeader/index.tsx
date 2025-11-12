import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'

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
  const { i18n } = useLingui()
  const dAppName = i18n._(name)

  return (
    <styled.Header iconSize={iconSize} gap={gap} padding={padding}>
      <img src={image} alt={dAppName} />
      <styled.Content>
        <h3>{dAppName}</h3>
        <styled.Description>{descriptionShort ? i18n._(descriptionShort) : ''}</styled.Description>
        {onSelect &&
          (isCompatible ? (
            <styled.AddButton onClick={onSelect}>
              <Trans>Add</Trans>
            </styled.AddButton>
          ) : (
            <styled.AddButton disabled title={t`Not compatible with current wallet type`}>
              <Trans>N/A</Trans>
            </styled.AddButton>
          ))}
      </styled.Content>
    </styled.Header>
  )
}
