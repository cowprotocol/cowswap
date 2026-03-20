import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useLingui } from '@lingui/react/macro'
import { Pocket } from 'react-feather'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { useCurrentAccountProxyAddress } from 'modules/accountProxy/hooks/useCurrentAccountProxy'
import { getProxyAccountUrl } from 'modules/accountProxy/utils/getProxyAccountUrl'

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
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()
  const proxyAddress = useCurrentAccountProxyAddress()
  const { i18n } = useLingui()

  if (!provider || !proxyAddress) return null

  const accountProxyLink = getProxyAccountUrl(chainId)

  const isWidget = isInjectedWidget()

  return (
    <ProxyPageLink
      to={accountProxyLink}
      className={className}
      onClick={onClick}
      target={isWidget ? '_blank' : undefined}
      rel={isWidget ? 'noopener noreferrer' : undefined}
    >
      <Pocket size={14} />
      <span>{i18n._(ACCOUNT_PROXY_LABEL)}</span>
    </ProxyPageLink>
  )
}
