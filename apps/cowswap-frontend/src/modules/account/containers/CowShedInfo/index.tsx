import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { Pocket } from 'react-feather'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { getShedRouteLink, useCurrentAccountProxyAddress } from 'modules/cowShed'

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
  const proxyAndAccount = useCurrentAccountProxyAddress()

  const { proxyAddress } = proxyAndAccount || {}

  if (!provider || !proxyAddress) return null

  const cowShedLink = getShedRouteLink(chainId)

  return (
    <ProxyPageLink to={cowShedLink} className={className} onClick={onClick}>
      <Pocket size={14} />
      <span>Account proxy</span>
    </ProxyPageLink>
  )
}
