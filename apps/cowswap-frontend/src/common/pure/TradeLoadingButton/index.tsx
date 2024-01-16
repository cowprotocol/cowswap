import { useEffect, useState } from 'react'

import { LONG_LOAD_THRESHOLD } from '@cowprotocol/common-const'

import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { Dots } from 'legacy/components/swap/styleds'
import { ThemedText } from 'legacy/theme'

const fadeIn = `
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`

const CenteredDots = styled(Dots)<{ smaller?: boolean }>`
  vertical-align: ${({ smaller = false }) => (smaller ? 'normal' : 'super')};
`

const LongLoadText = styled.span`
  animation: fadeIn 0.42s ease-in;

  ${fadeIn}
`

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
        {isLongLoad && <LongLoadText>Hang in there. Calculating best price </LongLoadText>}
        <CenteredDots smaller={isLongLoad} />
      </Text>
    </ThemedText.Main>
  )
}
