import { ReactNode } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ChevronRight } from 'react-feather'

import { Routes } from 'common/constants/routes'

import { AccountWrapper, IconWrapper, JazzIconStyled, Wrapper } from './styled'

import { parameterizeRoute } from '../../utils/parameterizeRoute'

interface AccountItemProps {
  chainId: SupportedChainId
  account: string
  version: string
}
export function AccountItem({ chainId, account, version }: AccountItemProps): ReactNode {
  return (
    <Wrapper to={parameterizeRoute(Routes.ACCOUNT_PROXY, { chainId, proxyAddress: account })}>
      <IconWrapper>
        <JazzIconStyled account={account} size={16} />
      </IconWrapper>
      <AccountWrapper>
        <h3>{shortenAddress(account)}</h3>
        <p>Version: {version}</p>
      </AccountWrapper>
      <div>
        <ChevronRight size={24} />
      </div>
    </Wrapper>
  )
}
