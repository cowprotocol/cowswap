import { Media } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { Polling } from 'legacy/components/Header/Polling'
import { useIsDarkMode } from 'legacy/state/user/hooks'
import { footerImage } from 'legacy/theme/cowSwapAssets'

import { Version } from '../Version'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0 24px 16px;

  > svg {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: auto;
    z-index: -1;

    ${Media.upToMedium()} {
      left: initial;
      bottom: initial;
      top: 0;
      margin: 24px auto 0;
    }

    ${Media.upToSmall()} {
      margin: 120px auto 0;
    }
  }

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    margin: 24px auto 0;
  }

  ${Media.upToSmall()} {
    margin: 56px auto 160px;
  }
`

const ImageWrapper = styled.div`
  display: flex;
  position: absolute;
  overflow: hidden;
  left: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  z-index: -1;

  ${Media.upToMedium()} {
    left: initial;
    bottom: initial;
    top: calc(100% - 100px);
    margin: 50px auto 0;
    height: 360px;
  }

  > svg {
    max-width: 100%;
    width: 100%;
    max-height: 100%;
    height: 100%;

    ${Media.upToMedium()} {
      transform: scale(1.7);
    }

    ${Media.upToSmall()} {
      transform: scale(2);
    }
  }
`

const FooterVersion = styled(Version)`
  margin: 0 auto 0 0;
  padding: 0;
  flex-flow: row wrap;

  ${Media.upToMedium()} {
    margin: 0 auto;
  }

  ${Media.upToSmall()} {
    flex-flow: column wrap;
    width: 100%;
    gap: 24px;
  }

  > div {
    ${Media.upToSmall()} {
      margin: 0 0 8px;
    }
  }
`

export default function Footer() {
  const darkMode = useIsDarkMode()

  return (
    <Wrapper>
      <FooterVersion />
      <Polling />

      <ImageWrapper>
        <SVG src={footerImage(darkMode)} description="CoW Swap footer image" />
      </ImageWrapper>
    </Wrapper>
  )
}
