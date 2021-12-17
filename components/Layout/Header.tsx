import styled from 'styled-components';
import Link from 'next/link'
import { transparentize } from 'polished'
import Button from 'components/Button'
import { Color, Font, Media } from 'const/styles/variables'
import { InView } from 'react-intersection-observer';

const LogoImage = 'images/logo.svg'

const Pixel = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    display:block;
    background: transparent;
`

const Wrapper = styled.header`
  z-index: 10;
  width: 100%;
  position: relative;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  padding: 2.4rem 5.6rem;
  margin: 0 auto;
  position: fixed;
  top: 0;
  left: 0;
  transition: background 0.5s ease-in-out;

  ${Media.mobile} {
    padding: 3rem;
  }

  &.sticky {

    background: ${transparentize(0.4, Color.black)};
    backdrop-filter: blur(60px);
  }
`

const Menu = styled.ol`
  display: flex;
  list-style: none;
  font-size: ${Font.sizeDefault};
  color: ${Color.grey};
  padding: 0;
  margin: 0;

  ${Media.mobile} {
    display: none;
  }

  > li:not(:last-of-type) {
    margin: 0 3.6rem 0 0;
  }

  > li > a {
    font-size: inherit;
    color: inherit;
    text-decoration: none;

    &:hover {
      color: ${Color.white};
    }
  }
`

const Logo = styled.div`
  width: 14rem;
  height: 5.7rem;
  background: url(${LogoImage}) no-repeat center/contain;
  cursor: pointer;

  ${Media.mobile} {
    width: 5.5rem;
    background-size: 14rem 100%;
    background-position: left;
  }
`

export default function Header({ siteConfig, menu }) {
  const swapURL = siteConfig.url.swap

  return (
    <InView threshold={1} delay={500}>
      {({ inView, ref }) => (
        <>
          <Pixel ref={ref} />
          <Wrapper className={!inView && 'sticky'}>

            <Link href="/">
              <Logo />
            </Link>

            <Menu>
              {menu.map(({ id, title, url, target, rel }) => (
                <li key={id}>
                  <a href={url} target={target} rel={rel}>{title}</a>
                </li>
              ))}
            </Menu>

            <Button paddingLR={2.4} href={swapURL} label={'Trade on CowSwap'} target="_blank" rel="noopener nofollow" />

          </Wrapper>
        </>
      )}
    </InView>
  )
}