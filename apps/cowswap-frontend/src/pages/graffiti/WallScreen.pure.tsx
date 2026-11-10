import type { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { ToolsSidebar } from './ToolsSidebar.pure'
import { PHASE_LABEL } from './wall.constants'
import * as styledEl from './wall.styled'
import { WallHeader } from './WallHeader.pure'
import { WallStage } from './WallStage.pure'

import type { WallModel } from './wallModel.types'

export interface WallScreenProps {
  wall: WallModel
}

export function WallScreen({ wall }: WallScreenProps): ReactNode {
  const { gate, layout, sync, brush, draft, plot, session, paint, actions, pointer } = wall
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
          />
        )}
      </styledEl.Main>

      {(layout.toolsVisible || paint.busy || settled) && (
        <styledEl.Footer>
          <span>{PHASE_LABEL[paint.phase] || <Trans>draw on the wall — cost updates live</Trans>}</span>
        </styledEl.Footer>
      )}
    </styledEl.Page>
  )
}
