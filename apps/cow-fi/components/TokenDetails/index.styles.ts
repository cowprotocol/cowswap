import styled from 'styled-components/macro'
import { Media, Color, UI } from '@cowprotocol/ui'
import Link from 'next/link'

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 32rem;
  grid-gap: 3.2rem;
  width: 100%;
  max-width: 126rem;
  margin: 0 auto;
  padding: 0 1.6rem;
  position: relative;
  color: ${Color.neutral10};

  ${Media.upToSmall()} {
    display: flex;
    max-width: 100%;
    flex-flow: column wrap;
    padding: 0 2.4rem;
  }

  h3 {
    font-size: 2.2rem;
    line-height: 1.2;
    margin: 1.2rem 0 0.8rem;
  }

  h4 {
    font-size: 2.2rem;
    line-height: 1.2;
    margin: 0 0 1.2rem;
  }

  li {
    padding: 0.8rem;
  }
`

export const MainContent = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 100%;
  overflow: hidden;
`

export const StickyContent = styled.div`
  position: sticky;
  top: 10rem;
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: max-content;
  overflow: visible;
`

export const SwapWidgetWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${Color.neutral100};
  height: 26.2rem;
  width: 100%;
  box-shadow:
    0 0.2rem 1.2rem rgba(0, 0, 0, 0.03),
    0 2rem 7rem rgba(0, 0, 0, 0.06),
    0 0.2rem 0.4rem rgba(0, 0, 0, 0.02);
  border-radius: 1.6rem;
  margin: 0 0 2rem;
  padding: 1.2rem;

  > b {
    font-size: 1.2rem;
  }
`

export const Section = styled.div`
  font-size: 1.6rem;
  display: flex;
  flex-direction: column;
  padding: 2rem 0;
  width: 100%;

  h1 {
    margin-bottom: 25px;
  }

  > p,
  > div > p,
  > div > pre,
  > div > ul {
    line-height: 1.6;
    color: ${Color.neutral10};
    margin: 0 0 2.8rem;
  }

  > div > ul {
    padding: 0 0 0 1.6rem;
  }

  > div > ul > li {
    padding: 0;
  }

  > div > pre {
    margin: 0 0 1.6rem;
    padding: 1.6rem;
    background: ${Color.neutral40};
    border-radius: 1rem;
  }

  > div > h4 {
    margin: 3.6rem 0 1rem;
  }

  h2 {
    font-size: 2.2rem;
    margin: 1.2rem 0 0.8rem;
  }

  a {
    color: ${Color.neutral10};
    text-decoration: none;
    transition: color 0.3s ease-in-out;
  }

  a:hover {
    text-decoration: underline;
  }
`

export const DetailHeading = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 1rem;
  width: 100%;
  margin: 0 0 0.6rem;

  > div {
    display: flex;
    align-items: center;
  }
`

export const TokenTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;
  font-size: 2.2rem;
  line-height: 1.2;

  > img {
    --size: 3.8rem;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
  }

  > h1 {
    font-size: 2.4rem;
    font-weight: inherit;
    margin: 0;
  }

  > span {
    padding: 0.6rem;
    background: ${Color.neutral80};
    color: ${Color.neutral10};
    border-radius: 0.4rem;
    font-size: 1.4rem;
    letter-spacing: 0.05rem;
    font-weight: 600;
  }
`

export const TokenChart = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: 1.3rem;
  margin: 0 auto 1rem;
  width: 100%;
  border-radius: 1.6rem;

  > b {
    margin: 1.6rem 0 0.8rem;
  }
`

export const NetworkTable = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
`

export const TokenLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  line-height: 1.2;
  gap: 0.8rem;
  text-decoration: none;
  color: ${Color.neutral10};
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${Color.neutral10};
    text-decoration: underline;
  }

  > img {
    width: var(--tokenSize);
    height: var(--tokenSize);
    border-radius: var(--tokenSize);
    background-color: ${Color.neutral10};
  }

  > span {
  }

  > span > i {
    text-transform: uppercase;
    font-style: normal;
    color: ${Color.neutral50};
  }
`

export const SwapCardsWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1.2rem;
  width: 100%;
`

export const SwapCard = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  justify-content: flex-start;
  border: 0.1rem solid ${Color.neutral40};
  transition: border 0.2s ease-in-out;
  border-radius: 1.2rem;
  padding: 0;
  font-size: 1.4rem;

  &:hover {
    border: 0.1rem solid ${Color.neutral10};

    > a > img:last-child {
      opacity: 1;
    }
  }

  > a {
    width: 100%;
    text-decoration: none;
    display: flex;
    gap: 1.2rem;
    align-items: center;
    padding: 1.2rem;
  }

  > a > img:first-child {
    --size: 2.8rem;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
  }

  > a > img:last-child {
    --size: 1.8rem;
    width: var(--size);
    height: var(--size);
    opacity: 0.6;
    transition: opacity 0.2s ease-in-out;
  }

  > a > b {
    line-height: 1.2;
    font-weight: 600;
  }
`

export const CopyMessage = styled.span`
  color: var(${UI.COLOR_SUCCESS_TEXT});
  font-size: 1.3rem;
  margin: 0 0 0 0.2rem;
`

export const Stats = styled.div`
  margin: 1.2rem 0;
  display: flex;
  flex-flow: row wrap;
  gap: 2rem;
  width: 100%;
  justify-content: space-between;
`

export const StatItem = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding: 1rem 0;
  gap: 0.2rem;
`

export const StatTitle = styled.div`
  font-size: 1.4rem;
  line-height: 1.2;
  color: ${Color.neutral10};
`

export const StatValue = styled.h5`
  font-size: 2rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
`

export const CopyIcon = styled.img`
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;
  padding: 0.2rem;
  margin-left: 5px;
  max-width: 20px;

  &:hover {
    opacity: 1;
  }
`

export const CopyWrapper = styled.div`
  display: flex;
  align-items: center;
  width: auto;
  min-width: 100px;
  text-align: right;
  justify-content: flex-end;

  ${Media.upToSmall()} {
    justify-content: flex-start;
  }
`
