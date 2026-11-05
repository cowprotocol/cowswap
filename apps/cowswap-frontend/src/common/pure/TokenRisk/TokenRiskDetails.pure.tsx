import { ReactNode } from 'react'

import { useTimeAgo } from '@cowprotocol/common-hooks'
import { safeShortenAddress } from '@cowprotocol/common-utils'
import { TokenWarning } from '@cowprotocol/tokens'

import { Trans } from '@lingui/react/macro'
import ms from 'ms.macro'

import * as styledEl from './TokenRisk.styled'
import { TokenRiskList } from './TokenRiskList.pure'

// The published file is regenerated nightly, so a second-by-second refresh buys nothing.
const TIME_AGO_INTERVAL = ms`1m`

export interface TokenRiskDetailsProps {
  warnings: TokenWarning[]
  symbol: string
  address: string
  updatedAt: string | undefined
  /** Shown when the serious risks below were confirmed at import. */
  acknowledgedNote?: ReactNode
  className?: string
}

export function TokenRiskDetails(props: TokenRiskDetailsProps): ReactNode {
  const { warnings, symbol, address, updatedAt, acknowledgedNote, className } = props

  const updatedAgo = useTimeAgo(updatedAt, TIME_AGO_INTERVAL)

  return (
    <styledEl.Panel className={className}>
      <TokenRiskList warnings={warnings} symbol={symbol} />
      <styledEl.Divider />
      <styledEl.Section>
        <styledEl.AboutHeading>
          <styledEl.SectionTitle>
            <Trans>About {symbol}</Trans>
          </styledEl.SectionTitle>
          <styledEl.AboutAddress>{safeShortenAddress(address)}</styledEl.AboutAddress>
        </styledEl.AboutHeading>
      </styledEl.Section>
      <styledEl.Footer>
        {acknowledgedNote && <styledEl.FooterNote>{acknowledgedNote}</styledEl.FooterNote>}
        <styledEl.FooterSource>
          {updatedAgo ? <Trans>Data from Jupiter · Updated {updatedAgo}</Trans> : <Trans>Data from Jupiter</Trans>}
        </styledEl.FooterSource>
      </styledEl.Footer>
    </styledEl.Panel>
  )
}
