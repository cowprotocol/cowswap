import type { CSSProperties, ReactNode } from 'react'

import { ToolsSidebar } from './ToolsSidebar.pure'
import { PHASE_LABEL } from './wall.constants'
import { styles } from './wall.styled'
import { WallHeader } from './WallHeader.pure'
import { WallStage } from './WallStage.pure'

import type { WallModel } from './wallModel.types'

const narrowMain: CSSProperties = { flexDirection: 'column', position: 'relative', minHeight: 0, flex: '1 1 auto' }

const DEFAULT_FOOTER = 'draw on the wall — cost updates live'

export interface WallScreenProps {
  wall: WallModel
}

export function WallScreen({ wall }: WallScreenProps): ReactNode {
  const { gate, layout, sync, brush, draft, plot, session, paint, actions, pointer } = wall
  const draftCost = draft.draft.size
  const cost = draftCost > 0 ? draftCost : pointer.liveCost
  const settled = paint.phase === 'done' || paint.phase === 'error'

  return (
    <div style={styles.page}>
      <WallHeader info={sync.info} wsStatus={sync.wsStatus} paintersOnline={sync.paintersOnline} seq={sync.seq} />

      <div style={{ ...styles.main, ...(layout.narrow ? narrowMain : {}) }}>
        <WallStage wall={wall} />
        {layout.toolsVisible && (
          <ToolsSidebar
            narrow={layout.narrow}
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
      </div>

      {(layout.toolsVisible || paint.busy || settled) && (
        <footer style={styles.footer}>
          <span>{PHASE_LABEL[paint.phase] || DEFAULT_FOOTER}</span>
        </footer>
      )}
    </div>
  )
}
