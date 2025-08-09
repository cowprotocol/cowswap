import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink, FiatAmount, Loader, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Menu, MenuPopover } from '@reach/menu-button'
import { MoreHorizontal } from 'react-feather'

import { AddressContextMenuContent } from 'common/pure/ClickableAddress/AddressContextMenuContent'

import { CowProtocolIcon } from './CowProtocolIcon'
import {
  LeftBottom,
  LeftTop,
  RightTop,
  AccountCardWrapper,
  MenuButton,
  MenuItems,
  AddressDisplay,
  AddressLinkWrapper,
  ValueLabel,
  ValueAmount,
  WatermarkIcon,
} from './styled'
import { AccountCardHoverBehavior } from './types'

import { AccountIcon } from '../AccountItem/AccountIcon'

interface AccountCardProps {
  children?: ReactNode
  width?: number | string
  height?: number | string
  borderRadius?: number
  padding?: number
  chainId?: SupportedChainId
  account?: string
  totalUsdAmount?: CurrencyAmount<Currency> | null
  loading?: boolean
  hoverBehavior?: AccountCardHoverBehavior
  enableScale?: boolean
  margin?: string
  minHeight?: number | string
  showWatermark?: boolean
}

function AccountCardContent({
  account,
  chainId,
  totalUsdAmount,
  loading,
  showWatermark = false,
}: {
  account: string
  chainId: SupportedChainId
  totalUsdAmount?: CurrencyAmount<Currency> | null
  loading?: boolean
  showWatermark?: boolean
}): ReactNode {
  const addressLink = getExplorerLink(chainId, account, ExplorerDataType.ADDRESS)

  return (
    <>
      <LeftTop>
        <ValueLabel>Recoverable value</ValueLabel>
        <ValueAmount>{loading ? <Loader size="24px" /> : <FiatAmount amount={totalUsdAmount} />}</ValueAmount>
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
        <ExternalLink href={addressLink}>
          <AddressLinkWrapper>
            <AccountIcon account={account} size={28} />
            <AddressDisplay>{shortenAddress(account)}</AddressDisplay>
          </AddressLinkWrapper>
        </ExternalLink>
      </LeftBottom>
      <CowProtocolIcon height={24} heightMobile={18} positionOffset={25} positionOffsetMobile={22} />
      {showWatermark && (
        <WatermarkIcon>
          <ProductLogo variant={ProductVariant.CowProtocol} logoIconOnly height={140} />
        </WatermarkIcon>
      )}
    </>
  )
}

export function AccountCard({
  children,
  width,
  height,
  borderRadius,
  padding,
  chainId,
  account,
  totalUsdAmount,
  loading,
  hoverBehavior = AccountCardHoverBehavior.SELF,
  enableScale = false,
  margin,
  minHeight,
  showWatermark = false,
}: AccountCardProps): ReactNode {
  if (children) {
    return (
      <AccountCardWrapper
        width={width}
        height={height}
        borderRadius={borderRadius}
        padding={padding}
        hoverBehavior={hoverBehavior}
        enableScale={enableScale}
        margin={margin}
        minHeight={minHeight}
      >
        {children}
        {showWatermark && (
          <WatermarkIcon>
            <ProductLogo variant={ProductVariant.CowProtocol} logoIconOnly height={140} />
          </WatermarkIcon>
        )}
      </AccountCardWrapper>
    )
  }

  if (!account || !chainId) {
    return null
  }

  return (
    <AccountCardWrapper
      width={width}
      height={height}
      borderRadius={borderRadius}
      padding={padding}
      hoverBehavior={hoverBehavior}
      enableScale={enableScale}
      margin={margin}
      minHeight={minHeight}
    >
      <AccountCardContent
        account={account}
        chainId={chainId}
        totalUsdAmount={totalUsdAmount}
        loading={loading}
        showWatermark={showWatermark}
      />
    </AccountCardWrapper>
  )
}
