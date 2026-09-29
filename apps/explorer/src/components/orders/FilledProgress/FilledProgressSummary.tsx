import type { ComponentProps, ReactNode } from 'react'

import { ProgressBar } from 'components/common/ProgressBar'

import { OrderAssetsInfo } from './OrderAssetsInfo'
import { Wrapper } from './styled'

type Props = ComponentProps<typeof OrderAssetsInfo> & { percentage: string }

export function FilledProgressSummary({ percentage, ...assets }: Props): ReactNode {
  return (
    <Wrapper>
      <ProgressBar percentage={percentage} />
      <OrderAssetsInfo {...assets} />
    </Wrapper>
  )
}
