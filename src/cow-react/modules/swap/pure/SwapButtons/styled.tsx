import styled from 'styled-components/macro'
import { Dots } from 'components/swap/styleds'
import { useCallback, useEffect, useState } from 'react'
import { LONG_LOAD_THRESHOLD } from 'constants/index'
import { ButtonSize, ThemedText } from 'theme'
import { Text } from 'rebass'
import { ButtonError } from 'components/Button'
import { RowBetween } from 'components/Row'

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

type TradeLoadingProps = {
  showButton?: boolean
}

export const TradeLoading = ({ showButton = false }: TradeLoadingProps) => {
  const [isLongLoad, setIsLongLoad] = useState<boolean>(false)

  // change message if user waiting too long
  useEffect(() => {
    const timeout = setTimeout(() => setIsLongLoad(true), LONG_LOAD_THRESHOLD)

    return () => clearTimeout(timeout)
  }, [])

  const InsideContent = useCallback(
    () => (
      <ThemedText.Main display="flex" alignItems="center" maxHeight={20}>
        <Text fontSize={isLongLoad ? 14 : 40} fontWeight={500}>
          {isLongLoad && <LongLoadText>Hang in there. Calculating best price </LongLoadText>}
          <CenteredDots smaller={isLongLoad} />
        </Text>
      </ThemedText.Main>
    ),
    [isLongLoad]
  )

  return showButton ? (
    <ButtonError id="swap-button" buttonSize={ButtonSize.BIG} disabled={true} maxHeight={60}>
      {InsideContent()}
    </ButtonError>
  ) : (
    InsideContent()
  )
}

export interface SwapButtonBoxProps extends TradeLoadingProps {
  showLoading?: boolean
  children?: React.ReactNode
}

export const SwapButtonBox = ({ children, showLoading = false, showButton = false }: SwapButtonBoxProps) =>
  showLoading ? (
    <TradeLoading showButton={showButton} />
  ) : (
    <Text fontSize={18} fontWeight={600}>
      {children}
    </Text>
  )

export function FeesExceedFromAmountMessage() {
  return (
    <RowBetween>
      <ButtonError buttonSize={ButtonSize.BIG} error id="swap-button" disabled>
        <Text fontSize={20} fontWeight={500}>
          Fees exceed from amount
        </Text>
      </ButtonError>
    </RowBetween>
  )
}
