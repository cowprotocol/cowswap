import { ReactNode } from 'react'

import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

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

export function HookDetailHeader({
  dapp,
  walletType,
  onSelect,
  iconSize,
  gap,
  padding,
}: HookDetailHeaderProps): ReactNode {
  const { name: dAppName, image, descriptionShort } = dapp
  const isCompatible = isHookCompatible(dapp, walletType)

  return (
    <styled.Header iconSize={iconSize} gap={gap} padding={padding}>
      <img src={image} alt={dAppName} />
      <styled.Content>
        <h3>{dAppName}</h3>
        <styled.Description>{descriptionShort}</styled.Description>
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
