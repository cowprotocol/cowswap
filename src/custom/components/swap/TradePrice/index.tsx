import React from 'react'
import styled from 'styled-components'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'
import { useIsQuoteRefreshing } from 'state/price/hooks'
import TradePriceModComponent, { TradePriceProps } from './TradePriceMod'
import { AnimatedImg } from 'pages/Swap'
import loadingCowGif from 'assets/cow-swap/cow-load.gif'
import repeat from 'assets/svg/repeat.svg'
import { StyledBalanceMaxMini } from 'components/swap/styleds'

const TradePriceMod = styled(TradePriceModComponent)`
  ${StyledBalanceMaxMini} {
    width: 30px;
    height: 30px;
    position: relative;
    overflow: hidden;
  }
`
const COW_LOADING_TIME = 4000
const LoadingCowComponent = ({ showCow }: { showCow: boolean }) => (
  <>
    <AnimatedImg src={loadingCowGif} showLoader={showCow} title="Updating prices..." />
    <AnimatedImg src={repeat} showLoader={!showCow} width="30px" padding="6px" />
  </>
)

export default function TradePrice(props: TradePriceProps) {
  const isRefreshingQuote = useIsQuoteRefreshing()
  const showCow = useLoadingWithTimeout(isRefreshingQuote, COW_LOADING_TIME)

  return <TradePriceMod {...props} LoadingCow={<LoadingCowComponent showCow={showCow} />} />
}
