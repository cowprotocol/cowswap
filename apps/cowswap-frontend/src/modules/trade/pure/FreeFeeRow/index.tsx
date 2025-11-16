import { ReactElement } from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

const GreenText = styled.span`
  color: var(${UI.COLOR_GREEN});
`

interface FreeFeeRowProps {
  withTimelineDot?: boolean
}

export function FreeFeeRow({ withTimelineDot = true }: FreeFeeRowProps): ReactElement {
  const { t } = useLingui()

  return (
    <ReviewOrderModalAmountRow
      withTimelineDot={withTimelineDot}
      tooltip={t`No fee for order placement!`}
      label={t`Fee`}
    >
      <GreenText>
        <Trans>FREE</Trans>
      </GreenText>
    </ReviewOrderModalAmountRow>
  )
}
