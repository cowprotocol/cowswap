import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { JazzIcon } from '@cowprotocol/wallet'

import { Menu, MenuPopover } from '@reach/menu-button'
import { MoreHorizontal } from 'react-feather'
import SVG from 'react-inlinesvg'

import { AddressContextMenuContent } from 'common/pure/ClickableAddress/AddressContextMenuContent'

import { LeftBottom, LeftTop, RightTop, Wrapper, MenuButton, MenuItems } from './styled'

import cowLogoImg from '../../img/cow-logo.svg'

interface AccountCardProps {
  chainId: SupportedChainId
  account: string
}

export function AccountCard({ chainId, account }: AccountCardProps): ReactNode {
  const addressLink = getExplorerLink(chainId, account, ExplorerDataType.ADDRESS)

  return (
    <Wrapper>
      <LeftTop>
        <span>Recoverable value</span>
        {/*TODO: add the value*/}
        <h2>$23,000</h2>
      </LeftTop>
      <RightTop>
        <Menu>
          <MenuButton>
            <MoreHorizontal size={20} />
          </MenuButton>
          <MenuPopover portal={false}>
            <MenuItems>
              <AddressContextMenuContent address={account} target={addressLink} />
            </MenuItems>
          </MenuPopover>
        </Menu>
      </RightTop>
      <LeftBottom>
        <i>
          <JazzIcon account={account} size={28} />
        </i>
        <span>{shortenAddress(account)}</span>
      </LeftBottom>
      <div>
        <SVG src={cowLogoImg} />
      </div>
    </Wrapper>
  )
}
