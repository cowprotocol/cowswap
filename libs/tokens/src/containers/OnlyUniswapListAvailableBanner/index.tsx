import { useIsCuratedListAvailable } from '../../hooks/lists/useIsCuratedListAvailable'
import styled from 'styled-components/macro'
import { UI } from '@cowprotocol/ui'
import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import { X } from 'react-feather'

const Wrapper = styled.div`
  width: 100%;
  padding: 6px 0;
  font-size: 14px;
  text-align: center;
  background-color: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_WHITE});
  position: relative;
`

const CloseIcon = styled(X)`
  height: 28px;
  width: 28px;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  position: absolute;
  right: 10px;
  top: 50%;
  margin-top: -15px;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: var(${UI.COLOR_WHITE});
  }
`

const bannerClosedAtom = atomWithStorage('OnlyUniswapListAvailableBanner', false)

/**
 * TODO: get review from Michel
 */
export function OnlyUniswapListAvailableBanner() {
  const [isBannerClose, setBannerClosed] = useAtom(bannerClosedAtom)
  const isOnlyUniswapListAvailable = useIsCuratedListAvailable()

  if (!isOnlyUniswapListAvailable || isBannerClose) return null

  return (
    <Wrapper>
      <p>The list of assets for trading is limited due to restrictions imposed by the SEC on users from the USA</p>
      <CloseIcon onClick={() => setBannerClosed(true)} />
    </Wrapper>
  )
}
