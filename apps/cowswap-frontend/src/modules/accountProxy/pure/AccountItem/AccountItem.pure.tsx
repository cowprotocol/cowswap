import { ReactNode } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ArrowIcon } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { Routes } from 'common/constants/routes'

import { AccountIcon } from './AccountIcon.pure'
import * as styledEl from './AccountItem.styled'

import { parameterizeRoute } from '../../utils/parameterizeRoute'
import { BaseAccountCard } from '../BaseAccountCard/BaseAccountCard.pure'
import { CowProtocolIcon } from '../CowProtocolIcon/CowProtocolIcon.pure'
import { SkeletonLines } from '../SkeletonLines/SkeletonLines.pure'

interface AccountItemProps {
  chainId: SupportedChainId
  account: string
  version?: string
  label?: string
  iconSize?: number
}
export function AccountItem({ chainId, account, version, label, iconSize = 28 }: AccountItemProps): ReactNode {
  return (
    <styledEl.Wrapper to={parameterizeRoute(Routes.ACCOUNT_PROXY, { chainId, proxyAddress: account })}>
      <BaseAccountCard width={90} height={56} borderRadius={8} padding={8} enableParentHover enableScale>
        <styledEl.MiniContent>
          <AccountIcon account={account} size={iconSize} />
          <SkeletonLines skeletonHeight={2} />
          <CowProtocolIcon height={6} positionOffset={0} />
        </styledEl.MiniContent>
      </BaseAccountCard>
      <styledEl.AccountWrapper>
        <h3>{shortenAddress(account)}</h3>
        <p>
          {label ?? (
            <>
              <Trans>Version</Trans>: {version}
            </>
          )}
        </p>
      </styledEl.AccountWrapper>

      <ArrowIcon />
    </styledEl.Wrapper>
  )
}
