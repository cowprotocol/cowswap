import { ReactNode } from 'react'

import { ButtonSecondary, HoverTooltip } from '@cowprotocol/ui'

import { Pocket } from 'react-feather'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { AddressLink } from 'common/pure/AddressLink'

import { useCurrentAccountProxyAddress } from '../../hooks/useCurrentAccountProxyAddress'
import { getShedRouteLink } from '../../utils/getShedRouteLink'

const TooltipWrapper = styled.div`
  max-width: 320px;
  padding: 10px;

  > p {
    margin-top: 0;
  }
`

const ReadMore = styled(Link)`
  text-decoration: none !important;
  font-size: 15px;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;

  > svg {
    margin-top: 3px;
  }
`

interface ProxyRecipientProps {
  recipient: string
  chainId: number
  size?: number
}

function Tooltip({ account, chainId }: { account: string; chainId: number }): ReactNode {
  const cowShedLink = getShedRouteLink(chainId)

  return (
    <TooltipWrapper>
      <p>
        Funds will be handled by a smart contract that is owned and fully controlled by your account (
        <AddressLink address={account} chainId={chainId} />)
      </p>
      <ReadMore to={cowShedLink} target="_blank">
        <ButtonSecondary>Read more</ButtonSecondary>
      </ReadMore>
    </TooltipWrapper>
  )
}

export function ProxyRecipient({ recipient, chainId, size = 14 }: ProxyRecipientProps): ReactNode {
  const proxyAndAccount = useCurrentAccountProxyAddress()

  if (!recipient || !proxyAndAccount) return null

  const { proxyAddress, account } = proxyAndAccount

  if (recipient.toLowerCase() !== proxyAddress.toLowerCase()) {
    throw new Error(
      `Provided proxy address does not match CoW Shed proxy address!, recipient=${recipient}, proxyAddress=${proxyAddress}`,
    )
  }

  const tooltipContent = <Tooltip account={account} chainId={chainId} />

  return (
    <HoverTooltip content={tooltipContent} placement="bottom">
      <Wrapper>
        <Pocket size={size} />
        <span>Account proxy</span>
      </Wrapper>
    </HoverTooltip>
  )
}
