import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  ExternalLink,
  FiatAmount,
  Loader,
  ContextMenuTooltip,
  ContextMenuCopyButton,
  ContextMenuExternalLink,
} from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { MoreHorizontal } from 'react-feather'

import { safeShortenAddress } from 'utils/address'

import { LeftBottom, LeftTop, RightTop, AddressDisplay, AddressLinkWrapper, ValueLabel, ValueAmount } from './styled'

import { AccountIcon } from '../AccountItem/AccountIcon'
import { CowProtocolIcon } from '../CowProtocolIcon'

interface DefaultAccountContentProps {
  account: string
  chainId: SupportedChainId
  totalUsdAmount?: CurrencyAmount<Currency> | null
  loading?: boolean
}

export function DefaultAccountContent({
  account,
  chainId,
  totalUsdAmount,
  loading,
}: DefaultAccountContentProps): ReactNode {
  const addressLink = getExplorerLink(chainId, account, ExplorerDataType.ADDRESS)

  return (
    <>
      <LeftTop>
        <ValueLabel>
          <Trans>Recoverable value</Trans>
        </ValueLabel>
        <ValueAmount aria-live="polite">
          {loading ? <Loader size="24px" /> : <FiatAmount amount={totalUsdAmount} />}
        </ValueAmount>
      </LeftTop>
      <RightTop>
        <ContextMenuTooltip
          placement="bottom"
          content={
            <>
              <ContextMenuCopyButton address={account} />
              <ContextMenuExternalLink href={addressLink} label={t`View details`} />
            </>
          }
        >
          <MoreHorizontal size={20} />
        </ContextMenuTooltip>
      </RightTop>
      <LeftBottom>
        <ExternalLink
          href={addressLink}
          aria-label={t`View account` + ` ${safeShortenAddress(account)} ` + t`on explorer`}
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
