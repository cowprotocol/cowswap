import { ReactNode } from 'react'

import { TokenWarning } from '@cowprotocol/tokens'
import { HoverTooltip } from '@cowprotocol/ui'

import { Plural, Trans } from '@lingui/react/macro'
import { AlertTriangle } from 'react-feather'

import * as styledEl from './TokenWarningsBadge.styled'
import { humanizeWarningType } from './TokenWarningsBadge.utils'

export interface TokenWarningsBadgeProps {
  warnings: TokenWarning[]
}

export function TokenWarningsBadge({ warnings }: TokenWarningsBadgeProps): ReactNode {
  if (!warnings.length) return null

  // Sorted worst-first upstream, so the first one carries the badge's severity.
  const severity = warnings[0].severity

  const tooltip = (
    <styledEl.TooltipContent>
      <styledEl.TooltipTitle>
        <Trans>Token warnings</Trans>
      </styledEl.TooltipTitle>
      {warnings.map((warning) => (
        <styledEl.WarningItem key={warning.type} severity={warning.severity}>
          <styledEl.WarningTitle severity={warning.severity}>{humanizeWarningType(warning.type)}</styledEl.WarningTitle>
          {warning.message && <styledEl.WarningMessage>{warning.message}</styledEl.WarningMessage>}
        </styledEl.WarningItem>
      ))}
    </styledEl.TooltipContent>
  )

  // HoverTooltip is deprecated in favour of NewTooltip, which opens only for mouse-like pointer
  // types. This badge is the only route to the warning text, so on touch that would leave a count
  // with no way to read what it means.
  return (
    <HoverTooltip wrapInContainer content={tooltip}>
      <styledEl.Badge severity={severity} type="button">
        <AlertTriangle />
        <Plural value={warnings.length} one="# Warning" other="# Warnings" />
      </styledEl.Badge>
    </HoverTooltip>
  )
}
