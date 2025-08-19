import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { FiatAmount, Loader } from '@cowprotocol/ui'
import { JazzIcon } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'
import { Menu, MenuPopover } from '@reach/menu-button'
import { MoreHorizontal } from 'react-feather'
import SVG from 'react-inlinesvg'

import { AddressContextMenuContent } from 'common/pure/ClickableAddress/AddressContextMenuContent'

import { LeftBottom, LeftTop, RightTop, Wrapper, MenuButton, MenuItems } from './styled'

import cowLogoImg from '../../img/cow-logo.svg'

interface AccountCardProps {
  chainId: SupportedChainId
  account: string
  totalUsdAmount: CurrencyAmount<Currency> | null
  loading: boolean
}

export function AccountCard({ chainId, account, totalUsdAmount, loading }: AccountCardProps): ReactNode {
  const addressLink = getExplorerLink(chainId, account, ExplorerDataType.ADDRESS)

  return (
    <Wrapper>
      <LeftTop>
        <span>
          <Trans>Recoverable value</Trans>
        </span>
        <h2>{loading ? <Loader size="24px" /> : <FiatAmount amount={totalUsdAmount} />}</h2>
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
