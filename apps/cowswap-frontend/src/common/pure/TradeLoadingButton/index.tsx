import { useEffect, useState } from 'react'

import { LONG_LOAD_THRESHOLD } from '@cowprotocol/common-const'
import { LongLoadText } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Text } from 'rebass'
import { ThemedText } from 'theme'

import { ThreeDots } from '../ThreeDots/ThreeDots.pure'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const TradeLoadingButton = () => {
  const [isLongLoad, setIsLongLoad] = useState<boolean>(false)

  // change message if user waiting too long
  useEffect(() => {
    const timeout = setTimeout(() => setIsLongLoad(true), LONG_LOAD_THRESHOLD)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <ThemedText.Main display="flex" alignItems="center" maxHeight={20}>
      <Text fontSize={isLongLoad ? 14 : 40} fontWeight={500}>
        {isLongLoad && (
          <LongLoadText>
            <Trans>Hang in there. Calculating best price</Trans>{' '}
          </LongLoadText>
        )}
        <ThreeDots />
      </Text>
    </ThemedText.Main>
  )
}
