import styled from 'styled-components/macro'
import { useIsDarkMode } from 'legacy/state/user/hooks'
import { Version } from '../Version'
import { Polling } from 'legacy/components/Header/Polling'
import SVG from 'react-inlinesvg'
import { footerImage } from 'legacy/theme/cowSwapAssets'

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

    ${({ theme }) => theme.mediaWidth.upToMedium`
      left: initial;
      bottom: initial;
      top: 0;
      margin: 24px auto 0;
    `}

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 120px auto 0;
    `}
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column wrap;
    margin: 24px auto 0;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 56px auto 160px;
  `}
`

const FooterVersion = styled(Version)`
  margin: 0 auto 0 0;
  padding: 0;
  flex-flow: row wrap;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0 auto;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: column wrap;
    width: 100%;
    gap: 24px;
  `}

  > div {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 0 8px;
    `}
  }
`

export default function Footer() {
  const darkMode = useIsDarkMode()

  return (
    <Wrapper>
      <FooterVersion />
      <Polling />
      <SVG src={footerImage(darkMode)} description="CoW Swap footer image" />
    </Wrapper>
  )
}
