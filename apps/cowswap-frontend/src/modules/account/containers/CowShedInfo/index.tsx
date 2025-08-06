import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { Pocket } from 'react-feather'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { getProxyAccountUrl, useCurrentAccountProxyAddress } from 'modules/accountProxy'

const ProxyPageLink = styled(Link)`
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 14px;

  &:hover {
    text-decoration: none !important;
  }
`

interface CowShedInfoProps {
  className?: string
  onClick?: Command
}

export function CowShedInfo({ className, onClick }: CowShedInfoProps): ReactNode {
  const { chainId } = useWalletInfo()
  const provider = useWalletProvider()
  const proxyAddress = useCurrentAccountProxyAddress()

  if (!provider || !proxyAddress) return null

  const accountProxyLink = getProxyAccountUrl(chainId)

  return (
    <ProxyPageLink to={accountProxyLink} className={className} onClick={onClick}>
      <Pocket size={14} />
      <span>{ACCOUNT_PROXY_LABEL}</span>
    </ProxyPageLink>
  )
}
