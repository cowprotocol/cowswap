import { ReactNode } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ArrowIcon } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { Routes } from 'common/constants/routes'

import { AccountIcon } from './AccountIcon'
import { AccountWrapper, Wrapper, MiniContent } from './styled'

import { AccountProxyKind } from '../../hooks/useAccountProxies'
import { parameterizeRoute } from '../../utils/parameterizeRoute'
import { BaseAccountCard } from '../BaseAccountCard'
import { CowProtocolIcon } from '../CowProtocolIcon'
import { SkeletonLines } from '../SkeletonLines'

interface AccountItemProps {
  chainId: SupportedChainId
  account: string
  kind: AccountProxyKind
  version?: string
  iconSize?: number
}
export function AccountItem({ chainId, account, kind, version, iconSize = 28 }: AccountItemProps): ReactNode {
  const secondaryLabel =
    kind === AccountProxyKind.TwapPrototype ? t`TWAP proxy account (prototype)` : `${t`Version`}: ${version}`

  return (
    <Wrapper to={parameterizeRoute(Routes.ACCOUNT_PROXY, { chainId, proxyAddress: account })}>
      <BaseAccountCard width={90} height={56} borderRadius={8} padding={8} enableParentHover enableScale>
        <MiniContent>
          <AccountIcon account={account} size={iconSize} />
          <SkeletonLines skeletonHeight={2} />
          <CowProtocolIcon height={6} positionOffset={0} />
        </MiniContent>
      </BaseAccountCard>
      <AccountWrapper>
        <h3>{shortenAddress(account)}</h3>
        <p>{secondaryLabel}</p>
      </AccountWrapper>

      <ArrowIcon />
    </Wrapper>
  )
}
