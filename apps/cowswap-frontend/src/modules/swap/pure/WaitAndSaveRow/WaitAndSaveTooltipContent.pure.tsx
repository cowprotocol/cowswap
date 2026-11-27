import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { WAIT_AND_SAVE_DOCS_HREF } from './waitAndSaveRow.constants'
import * as styledEl from './WaitAndSaveRow.styled'

export interface WaitAndSaveTooltipContentProps {
  saveAmount?: string
}

export function WaitAndSaveTooltipContent({ saveAmount }: WaitAndSaveTooltipContentProps): ReactNode {
  return (
    <styledEl.TooltipContent>
      <p>
        {saveAmount ? (
          <Trans>Join the next batch and pay no volume fee. That’s {saveAmount} less on this swap.</Trans>
        ) : (
          <Trans>Join the next batch and pay no volume fee.</Trans>
        )}
      </p>
      <p>
        <Trans>
          Matching with other orders can get you a better price too. That’s not guaranteed, and prices can change while
          you wait.
        </Trans>
      </p>
      <p>
        <Trans>The countdown isn’t a guaranteed fill time. Price-improvement fees still apply.</Trans>
      </p>
      <styledEl.DocsLink href={WAIT_AND_SAVE_DOCS_HREF}>
        <Trans>How Wait & save works</Trans> ↗
      </styledEl.DocsLink>
    </styledEl.TooltipContent>
  )
}
