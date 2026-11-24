import type { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { ToolsSidebar } from './ToolsSidebar.pure'
import { PHASE_LABEL } from './wall.constants'
import * as styledEl from './wall.styled'
import { WallHeader } from './WallHeader.pure'
import { WallStage } from './WallStage.pure'

import type { Tool } from './wall.types'
import type { WallModel } from './wallModel.types'

export interface WallScreenProps {
  wall: WallModel
}

interface ToolHintProps {
  tool: Tool
  label: string
}

export function WallScreen({ wall }: WallScreenProps): ReactNode {
  const { gate, layout, sync, brush, draft, plot, session, paint, actions, pointer, balance } = wall
  const draftCost = draft.draft.size
  const cost = draftCost > 0 ? draftCost : pointer.liveCost
  const settled = paint.phase === 'done' || paint.phase === 'error'

  return (
    <styledEl.Page>
      <WallHeader info={sync.info} wsStatus={sync.wsStatus} paintersOnline={sync.paintersOnline} seq={sync.seq} />

      <styledEl.Main>
        <WallStage wall={wall} />
        {layout.toolsVisible && (
          <ToolsSidebar
            brush={brush}
            connected={gate.connected}
            balance={balance}
            network={sync.info?.network ?? 'devnet'}
            session={session.session}
            plotLocked={session.plotLocked}
            plotConfirmed={session.plotConfirmed}
            draftCost={draftCost}
            cost={cost}
            canUndo={draft.canUndo}
            busy={paint.busy}
            phase={paint.phase}
            phaseError={paint.phaseError}
            paintDisabled={paint.paintDisabled}
            draftBox={draft.draftBox}
            boxTooBig={draft.boxTooBig}
            maxBoxWidth={plot.maxBoxWidth}
            maxBoxHeight={plot.maxBoxHeight}
            actions={actions}
            onPaint={paint.paint}
            onConnect={gate.openSolanaWalletModal}
            onHide={() => layout.setToolsVisible(false)}
            onResetPaint={paint.stalled ? paint.abandonPaint : undefined}
          />
        )}
      </styledEl.Main>

      {(layout.toolsVisible || paint.busy || settled) && (
        <styledEl.Footer>
          <span>{PHASE_LABEL[paint.phase] || <ToolHint tool={brush.tool} label={brush.label} />}</span>
        </styledEl.Footer>
      )}
    </styledEl.Page>
  )
}

/** What to do next with the tool in hand, where that is not obvious from the cursor. */
function ToolHint({ tool, label }: ToolHintProps): ReactNode {
  if (tool !== 'text') return <Trans>draw on the wall — cost updates live</Trans>

  if (!label.trim()) return <Trans>text tool: type your text in the tools panel, then tap the wall</Trans>

  return <Trans>tap the wall where your text should go — tap again to re-stamp</Trans>
}
