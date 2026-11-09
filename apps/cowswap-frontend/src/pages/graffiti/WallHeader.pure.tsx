import type { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { TOKEN_SYMBOL } from './wall.constants'
import * as styledEl from './wall.styled'

import type { CanvasInfo } from './graffiti.service'

export interface WallHeaderProps {
  info: CanvasInfo | null
  wsStatus: 'connected' | 'reconnecting'
  paintersOnline: number | null
  seq: number
}

export function WallHeader({ info, wsStatus, paintersOnline, seq }: WallHeaderProps): ReactNode {
  const live = wsStatus === 'connected'
  const size = info ? `${info.width}×${info.height}` : '…'
  const network = info ? info.network : '…'
  const painters = paintersOnline ?? '…'

  return (
    <styledEl.Header>
      <styledEl.Logo>🖍 Graffiti Wall</styledEl.Logo>
      <styledEl.Tag>
        <Trans>
          {size} · 1 {TOKEN_SYMBOL} per pixel · {network}
        </Trans>
      </styledEl.Tag>
      <styledEl.Spacer />
      <styledEl.LiveTag>
        <styledEl.Dot $live={live} />
        {live ? <Trans>live · {painters} painting</Trans> : <Trans>reconnecting…</Trans>} <Trans>· seq {seq}</Trans>
      </styledEl.LiveTag>
    </styledEl.Header>
  )
}
