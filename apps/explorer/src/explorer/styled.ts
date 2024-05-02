import styled, { createGlobalStyle, css } from 'styled-components/macro'

import { media } from '../theme/styles/media'

export const ScrollBarStyle = css`
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: hsla(0, 0%, 100%, 0.1);
    border-radius: 20px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }
`

export const GlobalStyle = createGlobalStyle`
  html {
    height: 100%;
    -webkit-tap-highlight-color: transparent;
  }
  html,
  body,
  #root {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    ${ScrollBarStyle}
  }

  .hover {
    cursor: pointer;
  }

  /* Cystoscape - BatchViewer styles */
  .target-popper {
    max-width: 50rem;
    padding: 1rem;
    margin: 0 0 1rem 0;
    text-align: left;
    font-size: 1.2rem;
    border-radius: 0.5rem;
    border: 1px solid rgb(45, 43, 51);
    background: rgb(60, 62, 78);
    line-height: 1.4rem;
    word-break: break-all;
  }
  .target-popper tr > td:first-child {
    font-weight: bold;
    text-transform: uppercase;
    width: 6.5rem;
  }
`

export const MainWrapper = styled.div`
  max-width: 118rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  > div {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: space-between;
    width: 100%;
  }
  footer {
    flex-direction: row;
    flex-wrap: wrap;
    flex-grow: 0;
  }
  header {
    margin-left: 0;
    margin-right: 0;
  }

  ${media.mediumDown} {
    max-width: 94rem;
    flex-flow: column wrap;
  }

  ${media.xSmallDown} {
    max-width: 100%;
    flex-grow: 1;

    footer {
      flex-direction: column;
      flex-wrap: nowrap;
    }
  }
`
