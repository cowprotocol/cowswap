import { ReactNode } from 'react'

import { bpsToPercent, formatPercent } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { Trans } from '@lingui/react/macro'

import { useSolanaTransferFeeBps } from 'common/hooks/useSolanaTransferFeeBps'

const DENY_LISTED_REASON = 'token is deny listed'

interface UnsupportedTokenReasonProps {
  chainId: SupportedChainId
  token: Token
  reason: string | undefined
}

export function UnsupportedTokenReason({ chainId, token, reason }: UnsupportedTokenReasonProps): ReactNode {
  const transferFeeBps = useSolanaTransferFeeBps(chainId, token.address)
  const symbol = token.symbol

  if (transferFeeBps) {
    const feePercent = formatPercent(bpsToPercent(transferFeeBps))

    return (
      <Trans>
        {symbol} charges a {feePercent}% fee on every transfer, which CoW Protocol does not support.
      </Trans>
    )
  }

  if (reason === DENY_LISTED_REASON) {
    return <Trans>{symbol} is unsupported: the token is on the denylist.</Trans>
  }

  if (reason) {
    return (
      <Trans>
        {symbol} is unsupported: {reason}
      </Trans>
    )
  }

  return null
}
