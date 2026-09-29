import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink, safeShortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import {
  ExternalLink,
  FiatAmount,
  Loader,
  ContextMenuTooltip,
  ContextMenuCopyButton,
  ContextMenuExternalLink,
} from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { MoreHorizontal } from 'react-feather'

import * as styledEl from './DefaultAccountContent.styled'

import { AccountIcon } from '../AccountItem/AccountIcon.pure'
import { CowProtocolIcon } from '../CowProtocolIcon/CowProtocolIcon.pure'

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
      <styledEl.LeftTop>
        <styledEl.ValueLabel>
          <Trans>Recoverable value</Trans>
        </styledEl.ValueLabel>
        <styledEl.ValueAmount aria-live="polite">
          {loading ? <Loader size="24px" /> : <FiatAmount amount={totalUsdAmount} />}
        </styledEl.ValueAmount>
      </styledEl.LeftTop>
      <styledEl.RightTop>
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
      </styledEl.RightTop>
      <styledEl.LeftBottom>
        <ExternalLink
          href={addressLink}
          aria-label={t`View account` + ` ${safeShortenAddress(account)} ` + t`on explorer`}
          rel="noopener noreferrer"
        >
          <styledEl.AddressLinkWrapper>
            <AccountIcon account={account} size={28} />
            <styledEl.AddressDisplay>{safeShortenAddress(account)}</styledEl.AddressDisplay>
          </styledEl.AddressLinkWrapper>
        </ExternalLink>
      </styledEl.LeftBottom>
      <CowProtocolIcon height={24} heightMobile={18} positionOffset={25} positionOffsetMobile={22} />
    </>
  )
}
