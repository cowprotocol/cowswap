import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { ButtonSecondary, HoverTooltip } from '@cowprotocol/ui'

import ReactDOM from 'react-dom'
import { Pocket } from 'react-feather'
import styled from 'styled-components/macro'

import { AddressLink } from 'common/pure/AddressLink'

import { useCurrentAccountProxyAddress } from '../../hooks/useCurrentAccountProxyAddress'
import { cowShedModalAtom } from '../../state/cowShedModalAtom'
import { CoWShedWidget } from '../CoWShedWidget'

const TooltipWrapper = styled.div`
  max-width: 320px;
  padding: 10px;

  > p {
    margin-top: 0;
  }
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

interface TooltipProps {
  chainId: number
  account: string
  onReadMore(): void
}

function Tooltip({ account, chainId, onReadMore }: TooltipProps): ReactNode {
  return (
    <TooltipWrapper>
      <p>
        Funds will be handled by a smart contract that is owned and fully controlled by your account (
        <AddressLink address={account} chainId={chainId} />)
      </p>
      <ButtonSecondary onClick={onReadMore}>Read more</ButtonSecondary>
    </TooltipWrapper>
  )
}

interface ProxyRecipientProps {
  recipient: string
  chainId: number
  size?: number
}

export function ProxyRecipient({ recipient, chainId, size = 14 }: ProxyRecipientProps): ReactNode {
  const proxyAndAccount = useCurrentAccountProxyAddress()
  const [cowShedModal, setCowShedModal] = useAtom(cowShedModalAtom)

  const toggleModal = (): void => {
    setCowShedModal((state) => ({
      ...state,
      isOpen: !state.isOpen,
    }))
  }

  if (!recipient || !proxyAndAccount) return null

  const { proxyAddress, account } = proxyAndAccount

  if (recipient.toLowerCase() !== proxyAddress.toLowerCase()) {
    throw new Error(
      `Provided proxy address does not match CoW Shed proxy address!, recipient=${recipient}, proxyAddress=${proxyAddress}`,
    )
  }

  const tooltipContent = <Tooltip account={account} chainId={chainId} onReadMore={toggleModal} />

  return (
    <>
      {cowShedModal.isOpen && ReactDOM.createPortal(<CoWShedWidget onDismiss={toggleModal} modalMode />, document.body)}
      <HoverTooltip content={tooltipContent} placement="bottom">
        <Wrapper>
          <Pocket size={size} />
          <span>Account proxy</span>
        </Wrapper>
      </HoverTooltip>
    </>
  )
}
