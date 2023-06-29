import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { PopupItem } from 'legacy/components/Popups/PopupItem'
import { useActivePopups } from 'legacy/state/application/hooks'
import { useURLWarningVisible } from 'legacy/state/user/hooks'
import { MEDIA_WIDTHS } from 'legacy/theme'

import { useWalletInfo } from 'modules/wallet'

export const MobilePopupInner = styled.div`
  height: 99%;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  flex-direction: row;
  -webkit-overflow-scrolling: touch;
  ::-webkit-scrollbar {
    display: none;
  }
`

export const MobilePopupWrapper = styled.div<{ show: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  background: ${({ theme }) => transparentize(0.05, theme.bg1)};
  display: none;

  ${({ theme, show }) => theme.mediaWidth.upToSmall`
    position: fixed;
    top: 0;
    z-index: 90;
    height: 100%;
    display: ${show ? 'flex' : 'none'};
  `};

  ${MobilePopupInner} {
    flex-flow: row wrap;
    padding: 20px;
    width: 100%;
    height: 100%;
    align-content: flex-start;
    overflow-x: hidden;
    overflow-y: auto; // fallback for 'overlay'
    overflow-y: overlay;
  }
`

const StopOverflowQuery = `@media screen and (min-width: ${MEDIA_WIDTHS.upToMedium + 1}px) and (max-width: ${
  MEDIA_WIDTHS.upToMedium + 500
}px)`

const FixedPopupColumn = styled(AutoColumn)<{ extraPadding: boolean; xlPadding: boolean }>`
  position: fixed;
  top: ${({ extraPadding }) => (extraPadding ? '132px' : '88px')};
  right: 1rem;
  max-width: 355px !important;
  width: 100%;
  z-index: 3;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};

  ${StopOverflowQuery} {
    top: ${({ extraPadding, xlPadding }) => (xlPadding ? '132px' : extraPadding ? '64px' : '56px')};
  }
`

export function Popups() {
  // get all popups
  const activePopups = useActivePopups()

  const urlWarningActive = useURLWarningVisible()

  // need extra padding if network is not L1 Ethereum
  const { chainId } = useWalletInfo()
  const isNotOnMainnet = Boolean(chainId && chainId !== SupportedChainId.MAINNET)

  return (
    <>
      <FixedPopupColumn gap="20px" extraPadding={urlWarningActive} xlPadding={isNotOnMainnet}>
        {activePopups.map((item) => (
          <PopupItem key={item.key} content={item.content} popKey={item.key} removeAfterMs={item.removeAfterMs} />
        ))}
      </FixedPopupColumn>
      <MobilePopupWrapper show={activePopups?.length > 0}>
        <MobilePopupInner>
          {activePopups // reverse so new items up front
            .slice(0)
            .reverse()
            .map((item) => (
              <PopupItem key={item.key} content={item.content} popKey={item.key} removeAfterMs={item.removeAfterMs} />
            ))}
        </MobilePopupInner>
      </MobilePopupWrapper>
    </>
  )
}
