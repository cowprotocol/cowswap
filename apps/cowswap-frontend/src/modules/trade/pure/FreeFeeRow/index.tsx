import { ReactElement } from 'react'

import { CenteredDots, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

const GreenText = styled.span`
  color: var(${UI.COLOR_GREEN});
`

interface FreeFeeRowProps {
  withTimelineDot?: boolean
  loading?: boolean
}

export function FreeFeeRow({ withTimelineDot = true, loading }: FreeFeeRowProps): ReactElement {
  return (
    <ReviewOrderModalAmountRow
      withTimelineDot={withTimelineDot}
      tooltip={t`No fee for order placement!`}
      label={t`Fee`}
    >
      {loading ? (
        <CenteredDots />
      ) : (
        <GreenText>
          <Trans>FREE</Trans>
        </GreenText>
      )}
    </ReviewOrderModalAmountRow>
  )
}
