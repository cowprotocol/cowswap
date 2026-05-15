import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { CopyButton, ExternalLink, FiatAmount, Loader } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { safeShortenAddress } from 'utils/address'

import { LeftBottom, LeftTop, AddressDisplay, AddressLinkWrapper, ValueLabel, ValueAmount } from './styled'

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
        <CopyButton value={account} iconOnly aria-label={t`Copy address`} />
      </LeftBottom>
      <CowProtocolIcon height={24} heightMobile={18} positionOffset={25} positionOffsetMobile={22} />
    </>
  )
}
