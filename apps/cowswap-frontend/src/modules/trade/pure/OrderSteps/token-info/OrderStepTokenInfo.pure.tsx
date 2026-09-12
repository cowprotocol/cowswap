import { ReactNode } from 'react'

import {
  ExplorerDataType,
  getCurrencyAddress,
  getExplorerLink,
  getIsNativeToken,
  shortenAddress,
} from '@cowprotocol/common-utils'
import { Currency } from '@cowprotocol/currency'
import { TokenLogo } from '@cowprotocol/tokens'

import { t } from '@lingui/core/macro'

import * as styledEl from './OrderStepTokenInfo.styled'

const TOKEN_LOGO_SIZE = 16

export interface OrderStepTokenInfoProps {
  token: Currency
}

export function OrderStepTokenInfo({ token }: OrderStepTokenInfoProps): ReactNode {
  const address = getCurrencyAddress(token)
  const isNative = getIsNativeToken(token)
  const explorerUrl = isNative ? '' : getExplorerLink(token.chainId, address, ExplorerDataType.TOKEN)
  const shortAddress = shortenAddress(address)
  const symbol = token.symbol

  return (
    <styledEl.TokenInfo>
      <TokenLogo token={token} size={TOKEN_LOGO_SIZE} hideNetworkBadge />
      <span>
        {symbol ? `${symbol} · ` : null}
        {explorerUrl ? (
          <styledEl.TokenInfoLink href={explorerUrl} title={t`View on explorer`}>
            {shortAddress} ↗
          </styledEl.TokenInfoLink>
        ) : (
          shortAddress
        )}
      </span>
    </styledEl.TokenInfo>
  )
}
