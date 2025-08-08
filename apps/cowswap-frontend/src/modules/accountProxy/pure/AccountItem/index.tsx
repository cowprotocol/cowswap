import { ReactNode } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ArrowIcon } from '@cowprotocol/ui'

import { Routes } from 'common/constants/routes'

import { AccountIcon } from './AccountIcon'
import { AccountWrapper, Wrapper, MiniContent } from './styled'

import { parameterizeRoute } from '../../utils/parameterizeRoute'
import { AccountCard } from '../AccountCard'
import { CowProtocolIcon } from '../AccountCard/CowProtocolIcon'
import { SkeletonLines } from '../AccountCard/SkeletonLines'

interface AccountItemProps {
  chainId: SupportedChainId
  account: string
  version: string
  iconSize?: number
}
export function AccountItem({ chainId, account, version, iconSize = 28 }: AccountItemProps): ReactNode {
  return (
    <Wrapper to={parameterizeRoute(Routes.ACCOUNT_PROXY, { chainId, proxyAddress: account })}>
      <AccountCard width={90} height={56} borderRadius={8} padding={8} hoverScale externalHover>
        <MiniContent>
          <AccountIcon account={account} size={iconSize} />
          <SkeletonLines skeletonHeight={2} />
          <CowProtocolIcon height={6} positionOffset={0} />
        </MiniContent>
      </AccountCard>
      <AccountWrapper>
        <h3>{shortenAddress(account)}</h3>
        <p>Version: {version}</p>
      </AccountWrapper>

      <ArrowIcon />
    </Wrapper>
  )
}
