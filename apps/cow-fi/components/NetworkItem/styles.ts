import styled from 'styled-components'
import { Color, Media } from 'styles/variables'
import { transparentize } from 'polished'

export const NetworkHeaderItem = styled.div`
  display: contents;
  display: grid;
  grid-template-columns: 14rem auto auto;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 0.1rem solid ${transparentize(0.9, Color.darkBlue)};
  color: ${Color.text1};
  gap: 0.8rem;
  width: 100%;

  ${Media.mobile} {
    padding: 2.4rem 0;
    gap: 1.4rem;
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }

  > div {
    font-weight: normal;
    font-size: 1.4rem;
    line-height: 1;
  }
`

export const ItemWrapper = styled(NetworkHeaderItem)`
  font-size: 1.6rem;
  color: ${Color.darkBlue};

  > a {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.6rem;
    line-height: 1;
    text-decoration: none;
    font-weight: 600;
  }

  > a:hover {
    text-decoration: underline;
  }

  > a > img {
    --size: 2rem;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    object-fit: contain;
  }

  > a:last-child {
    font-weight: 400;
  }

  > div {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    font-weight: normal;
    font-size: inherit;
  }

  > span {
    display: flex;
    flex-flow: row wrap;
    gap: 1.2rem;
    margin: 0 0 0 auto;
    position: relative;

    ${Media.mobile} {
      width: 100%;
    }
  }

  > span > a > img,
  > span > img {
    --size: 2rem;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
  }

  > a > div {
    display: flex;
    align-items: center;
    font-size: 1.5rem;

    ${Media.mobile} {
      flex-flow: column wrap;
      align-items: flex-start;
    }
  }

  > a > div > img {
    --size: 2.4rem;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
  }

  > a > div > i {
    font-style: normal;
    font-weight: 400;
    word-break: break-all;
  }
`
