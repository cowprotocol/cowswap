import { ReactNode } from 'react'

import type { MessageDescriptor } from '@lingui/core'

import { shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ArrowIcon } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'

import { Routes } from 'common/constants/routes'

import { AccountIcon } from './AccountIcon'
import { AccountWrapper, Wrapper, MiniContent } from './styled'

import { parameterizeRoute } from '../../utils/parameterizeRoute'
import { BaseAccountCard } from '../BaseAccountCard'
import { CowProtocolIcon } from '../CowProtocolIcon'
import { SkeletonLines } from '../SkeletonLines'

interface AccountItemProps {
  chainId: SupportedChainId
  account: string
  version?: string
  label?: MessageDescriptor
  iconSize?: number
}
export function AccountItem({ chainId, account, version, label, iconSize = 28 }: AccountItemProps): ReactNode {
  const { i18n } = useLingui()

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
        <p>
          {label ? (
            i18n._(label)
          ) : (
            <>
              <Trans>Version</Trans>: {version}
            </>
          )}
        </p>
      </AccountWrapper>

      <ArrowIcon />
    </Wrapper>
  )
}
