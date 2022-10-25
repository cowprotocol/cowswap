import styled from 'styled-components/macro'
import { useIsDarkMode } from 'state/user/hooks'
import { Version } from '../Version'
import { Polling } from '../Header/Polling'
import SVG from 'react-inlinesvg'
import { footerImage } from 'theme/cowSwapAssets'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  margin: auto 16px;
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
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: auto 0 100px;
  `}
`

const FooterVersion = styled(Version)`
  margin: 0 auto 0 0;
  padding: 0;
  flex-flow: row wrap;

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
