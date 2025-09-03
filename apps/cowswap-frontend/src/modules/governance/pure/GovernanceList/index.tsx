import React from 'react'

import { Trans } from '@lingui/react/macro'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function GovernanceList() {
  return (
    <ul>
      <li>
        <Trans>Proposal 1</Trans>
      </li>
      <li>
        <Trans>Proposal 2</Trans>
      </li>
    </ul>
  )
}
