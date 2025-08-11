import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink, FiatAmount, Loader } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Menu, MenuPopover } from '@reach/menu-button'
import { MoreHorizontal } from 'react-feather'

import { AddressContextMenuContent } from 'common/pure/ClickableAddress/AddressContextMenuContent'

import {
  LeftBottom,
  LeftTop,
  RightTop,
  MenuButton,
  MenuItems,
  AddressDisplay,
  AddressLinkWrapper,
  ValueLabel,
  ValueAmount,
} from './styled'

import { AccountIcon } from '../AccountItem/AccountIcon'
import { CowProtocolIcon } from '../CowProtocolIcon'

function safeShortenAddress(address: string): string {
  try {
    return shortenAddress(address)
  } catch {
    return address
  }
}

interface DefaultAccountContentProps {
  account: string
  chainId: SupportedChainId
  totalUsdAmount?: CurrencyAmount<Currency> | null
  loading?: boolean
}

export function DefaultAccountContent({ account, chainId, totalUsdAmount, loading }: DefaultAccountContentProps): ReactNode {
  const addressLink = getExplorerLink(chainId, account, ExplorerDataType.ADDRESS)

  return (
    <>
      <LeftTop>
        <ValueLabel>Recoverable value</ValueLabel>
        <ValueAmount aria-live="polite">
          {loading ? <Loader size="24px" /> : <FiatAmount amount={totalUsdAmount} />}
        </ValueAmount>
      </LeftTop>
      <RightTop>
        <Menu>
          <MenuButton aria-label="Account options menu">
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
        <ExternalLink
          href={addressLink}
          aria-label={`View account ${safeShortenAddress(account)} on explorer`}
          rel="noopener noreferrer"
        >
          <AddressLinkWrapper>
            <AccountIcon account={account} size={28} />
            <AddressDisplay>{safeShortenAddress(account)}</AddressDisplay>
          </AddressLinkWrapper>
        </ExternalLink>
      </LeftBottom>
      <CowProtocolIcon height={24} heightMobile={18} positionOffset={25} positionOffsetMobile={22} />
    </>
  )
}