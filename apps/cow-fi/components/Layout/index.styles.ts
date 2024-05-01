import styled from 'styled-components'
import { lighten, transparentize } from 'polished'
import { Color, Font, Media } from 'styles/variables'

export const Content = styled.main`
  margin: 0 auto;
  padding: 20rem 3.2rem;
  box-sizing: border-box;
  width: 100%;
  max-width: 90rem;
  display: flex;
  flex-flow: column wrap;
  min-height: 80rem;

  ${Media.mobile} {
    height: auto;
    max-width: 100%;
    min-height: initial;
    padding: 12rem 3.2rem;
  }

  p {
    margin: 0 0 1.6rem;
    font-size: ${Font.sizeDefault};
    color: ${Color.text2};
    line-height: 1.4;
  }
`

export const Section = styled.section<{ margin?: string }>`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  margin: ${({ margin }) => (margin ? margin : '0 0 4rem')};
  position: relative;
  z-index: 1;

  > p {
    font-size: 1.8rem;
    text-align: center;
    width: 100%;
  }

  a {
    color: ${Color.lightBlue};
    transition: color 0.3s ease-in-out;

    &:hover {
      color: ${lighten(0.1, Color.lightBlue)};
    }
  }

  > h3,
  > h4 {
    font-size: 2.8rem;
    width: 100%;
    margin: 2.4rem auto;
    line-height: 1.2;
  }

  > h4 {
    font-size: 2rem;
    margin: 1.6rem auto 0.2rem;
  }

  > ul {
    text-align: left;
    color: ${Color.text2};
  }

  > ul > li {
    line-height: 1.4;
  }
`

export const Title = styled.h1`
  width: 100%;
  font-size: 6rem;
  line-height: 1.2;
  margin: 0 0 4rem;
  text-align: center;
  word-break: break-word;
  font-weight: ${Font.weightMedium};
  background: ${Color.gradient};
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  > span {
    background: none;
    background-clip: initial;
    -webkit-background-clip: initial;
    -webkit-text-fill-color: initial;
  }

  &::selection {
    background-clip: initial;
    -webkit-background-clip: initial;
    -webkit-text-fill-color: initial;
  }

  ${Media.mobile} {
    font-size: 4rem;
  }
`

export const SubTitle = styled.h2`
  font-size: 2.5rem;
  line-height: 1.5;
  font-weight: ${Font.weightNormal};
  opacity: 0.75;
  text-align: center;
  margin: 0 0 1.2rem;

  ${Media.mobile} {
    font-size: 2rem;
  }
`

export const TitleSmall = styled.h3`
  font-size: 2.4rem;
  line-height: 1.2;
  margin: 0 0 2.4rem;
`

export const LinkContainer = styled.a`
  display: flex;
  flex-flow: column wrap;
  box-sizing: border-box;
  padding: 2.4rem 6.2rem 2.4rem 2.4rem;
  margin: 0 0 1.6rem;
  border-radius: 1.6rem;
  align-items: flex-start;
  justify-content: center;
  font-size: 1.8rem;
  background: ${Color.darkBlue4};
  border: 0.1rem solid ${transparentize(0.9, Color.lightBlue)};
  color: ${Color.white};
  transition: color 0.2s ease-in-out, background 0.2s ease-in-out, border 0.2s ease-in-out;
  font-weight: ${Font.weightLight};
  text-decoration: none;
  position: relative;
  max-width: 100%;
  width: 100%;

  ${Media.mobile} {
    padding: 1.6rem 6.2rem 1.6rem 1.6rem;
  }

  &:last-of-type {
    margin: 0 0 2.4rem;
  }

  &:link,
  &:visited {
    color: inherit;
  }

  &:hover {
    background: ${Color.darkBlue2};
    border: 0.1rem solid ${Color.darkBlue};

    > svg {
      transform: translateX(0.6rem);
    }
    /* > svg > path { fill: ${Color.darkBlue}} } */
  }

  > b {
    line-height: 1.3;

    ${Media.mobile} {
      font-size: 1.6rem;
    }
  }

  > i {
    font-size: 1.6rem;
    line-height: 1.3;
    font-style: normal;
    margin: 0.8rem 0 0;

    ${Media.mobile} {
      font-size: 1.4rem;
    }
  }

  > svg {
    display: block;
    position: absolute;
    right: 2.4rem;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 2.4rem;
    height: 2.4rem;
    transform: translateX(0);
    transition: transform 0.2s ease-in-out;

    > path {
      fill: ${transparentize(0.7, Color.white)};
    }
  }
`

export const Card = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  flex-flow: row wrap;
  flex: 1 1 auto;
  justify-content: center;
  align-items: center;
  align-content: center;
  gap: 5rem;
  z-index: 1;
  border-radius: 1.6rem;
  background: ${Color.darkBlue4};
  padding: 6rem;
  margin: 0 auto;

  ${Media.mobile} {
    display: flex;
    flex-flow: column wrap;
    padding: 2.4rem;
    gap: 2.4rem;
  }

  > h3 {
    width: 100%;
    text-align: center;
    font-size: 4.5rem;
    line-height: 1.2;
    font-weight: ${Font.weightMedium};
    background: ${Color.gradient};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    ${Media.mobile} {
      font-size: 2.4rem;
    }

    > span {
      background: none;
      background-clip: initial;
      -webkit-background-clip: initial;
      -webkit-text-fill-color: initial;
    }

    &::selection {
      background-clip: initial;
      -webkit-background-clip: initial;
      -webkit-text-fill-color: initial;
    }
  }

  > p {
    font-size: 1.9rem;
    text-align: center;
    max-width: 100%;
  }

  a {
    color: ${Color.lightBlue};
  }
`
