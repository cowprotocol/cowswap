import { ReactNode } from 'react'

import { TokenWarning } from '@cowprotocol/tokens'
import { HoverTooltip } from '@cowprotocol/ui'

import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { AlertTriangle } from 'react-feather'

import * as styledEl from './TokenWarningsBadge.styled'
import { getWarningTitle } from './TokenWarningsBadge.utils'

export interface TokenWarningsBadgeProps {
  warnings: TokenWarning[]
}

export function TokenWarningsBadge({ warnings }: TokenWarningsBadgeProps): ReactNode {
  const { i18n } = useLingui()

  if (!warnings.length) return null

  // Sorted worst-first upstream, so the first one carries the badge's severity.
  const severity = warnings[0].severity

  const tooltip = (
    <styledEl.TooltipContent>
      <styledEl.TooltipTitle>
        <Trans>Token warnings</Trans>
      </styledEl.TooltipTitle>
      {warnings.map((warning) => {
        const title = getWarningTitle(warning.code)

        return (
          <styledEl.WarningItem key={warning.code} severity={warning.severity}>
            {title && <styledEl.WarningTitle severity={warning.severity}>{i18n._(title)}</styledEl.WarningTitle>}
            {warning.message && <styledEl.WarningMessage>{warning.message}</styledEl.WarningMessage>}
          </styledEl.WarningItem>
        )
      })}
    </styledEl.TooltipContent>
  )

  // NewTooltip opens only for mouse-like pointer types and this badge is the only route to the
  // warning text, so the deprecated HoverTooltip stays. It binds no click handler on mobile either;
  // the <button> trigger is what makes mobile browsers emit the synthetic mouse events it listens for.
  return (
    <HoverTooltip wrapInContainer content={tooltip}>
      <styledEl.Badge severity={severity} type="button">
        <AlertTriangle />
        <Plural value={warnings.length} one="# Warning" other="# Warnings" />
      </styledEl.Badge>
    </HoverTooltip>
  )
}
