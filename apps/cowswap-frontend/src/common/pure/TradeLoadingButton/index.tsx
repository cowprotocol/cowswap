import { ReactNode, useEffect, useState } from 'react'

import { LONG_LOAD_THRESHOLD } from '@cowprotocol/common-const'
import { LongLoadText } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { ThreeDots } from '../ThreeDots/ThreeDots.pure'

export function TradeLoadingButton(): ReactNode {
  const [isLongLoad, setIsLongLoad] = useState<boolean>(false)

  // change message if user waiting too long
  useEffect(() => {
    const timeout = setTimeout(() => setIsLongLoad(true), LONG_LOAD_THRESHOLD)

    return () => clearTimeout(timeout)
  }, [])

  if (isLongLoad) {
    return (
      <LongLoadText>
        <Trans>Hang in there. Calculating best price</Trans>
        <ThreeDots />
      </LongLoadText>
    )
  }

  return <ThreeDots centered />
}
