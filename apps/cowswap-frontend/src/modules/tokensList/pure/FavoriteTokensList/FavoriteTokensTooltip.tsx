import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'

import * as styledEl from './styled'

export function FavoriteTokensTooltip(): ReactNode {
  return (
    <styledEl.FavoriteTooltip
      text={
        <Trans>
          Your favorite saved tokens. Edit this list in the <Link to="/account/tokens">Tokens page</Link>.
        </Trans>
      }
    />
  )
}
