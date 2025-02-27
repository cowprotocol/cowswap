import { Color, Media } from '@cowprotocol/ui'

import styled, { createGlobalStyle, css } from 'styled-components/macro'

export const ScrollBarStyle = css`
  --scrollbarWidth: 0.6rem;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: var(--scrollbarWidth);
    height: var(--scrollbarWidth);
  }

  &::-webkit-scrollbar-thumb {
    background-color: hsla(0, 0%, 100%, 0.25);
    border-radius: 2rem;
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
    display: block;
    max-width: 100vw;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
    position: relative;
    ${ScrollBarStyle}
  }

  // TODO: remove this once we have a proper way to set global CSS variables for all apps
  :root {
    --cow-color-alert-text: ${Color.explorer_yellow4};
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
  --pageMaxWidth: 140rem;
  max-width: var(--pageMaxWidth);
  width: 100%;
  min-height: 100vh;
  height: auto;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    max-width: 100%;
  }

  ${Media.upToExtraSmall()} {
    flex-grow: 1;
  }

  header {
    margin-left: 0;
    margin-right: 0;
  }
`
