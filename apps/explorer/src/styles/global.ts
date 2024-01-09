import { createGlobalStyle } from 'styled-components'
import variables from './variables'
import checkWhite from 'assets/img/check-white.svg'

const GlobalStyles = createGlobalStyle`
  /* global root variables */
  ${variables}

  html, body {  
    width: 100%;
    min-height: 100vh;
    min-width: 300px;
    margin: 0;
    font-size: 62.5%;
    line-height: 10px;
    font-family: var(--font-default);
    background-color: var(--color-background);
    color: var(--color-text-primary);
    box-sizing: border-box;
    scroll-behavior: smooth;
    text-rendering: geometricPrecision;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *::selection {
    background: var(--color-background-selection); /* WebKit/Blink Browsers */
    color: var(--color-text-selection);
  }
  *::-moz-selection {
    background: var(--color-background-selection); /* Gecko Browsers */
  }
  *::-webkit-selection {
    background: var(--color-background-selection); /* Chrome Browsers */
  }

  *::-moz-placeholder {
    line-height: revert;
  }

  ::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
  }
  ::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,.2);
  }
  ::-webkit-scrollbar-track {
      background: hsla(0,0%,100%,.1);
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }
  a {   
    text-decoration: underline;
    cursor: pointer;
      &:link, 
      &:visited {
        color: var(--color-text-active);
      }
  }

  h1, h2, h3 {
    margin: 0;
    margin: 0.5rem 0;
  }
  h1 {
    font-size: 3rem;
  }
  h2 {
    font-size: 2rem;
  }

  #root {
    height: 100%;
    font-size: 1.3rem;
  }

  button {
    background-color: var(--color-background-CTA);
    color: var(--color-text-CTA);
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    transition-property: color, background-color, border-color, opacity;
    border: 0;
    font-weight: var(--font-weight-bold);
    outline: 0;

    &:hover {
      background-color: var(--color-background-button-hover);
      color: var(--color-text-button-hover);
    }

    &.cancel {
      background: transparent;
      color: var(--color-text-active);

      &:hover {
        background-color: var(--color-background-button-hover);
        color: var(--color-text-button-hover);
      } 
    }

    &:disabled,
    &[disabled]{
      &:hover {
        background-color: var(--color-background-button-disabled-hover);
      }
      opacity: .35;
      pointer-events: none;
    }
    &.success {
      border-color: var(--color-button-success);
      color: var(--color-button-success);
      :hover {
        background-color: var(--color-button-success);
        border-color: var(--color-button-success);
        color: var(--color-background-pageWrapper);
      }
    }
    &.danger {
      border-color: var(--color-button-danger);
      color: var(--color-button-danger);
      :hover {
        background-color: var(--color-button-danger);
        border-color: var(--color-button-danger);
        color: var(--color-background-pageWrapper);
      }
    }
    &.secondary {
      border-color: var(--color-button-secondary);
      color: var(--color-button-secondary);
      :hover {
        border-color: black;
        color: black;
      }
    }
    &.big {
      font-size: 1.2rem;
      padding: 0.65rem 1rem;
    }
    &.small {
      font-size: 0.6rem;
      padding: 0.3rem 0.5rem;
    }
  }

  input {
    background-color: var(--color-background-pageWrapper);
    border: 0.11rem solid transparent;
    border-radius: var(--border-radius);
    color: var(--color-text-primary);
    outline: none;
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: var(--font-weight-bold);
    padding: 0.65rem;
    margin: 0.4rem 0.85rem;
    width: 100%;
    line-height: 1;
    
    &::placeholder {
      color: inherit;
      font-size: inherit;
    }
    
    &:focus::placeholder {
      color: transparent;
    }
    
    &[type="checkbox"] {
      margin: 0 auto;
      background: transparent;
      appearance: none;
      border: 0.2rem solid var(--color-text-secondary);
      border-radius: 0.3rem;
      box-sizing: border-box;
      height: 1.4rem;
      width: 1.4rem;
      padding: 0;
      cursor: pointer;
      outline: 0;
      
        &:checked {
          background: var(--color-text-active) url(${checkWhite}) no-repeat center/.85rem;
          border: 0.2rem solid transparent;
        }
    }

    &:focus {
      border-color: var(--color-text-primary);
    }
    &:disabled {
      opacity: .8;
    }
  }
  
  .noScroll {
    overflow: hidden;
  }

  .not-implemented {
    display: none !important
  }

  
  /* Web3Connect styling
  SUUUUPER lame and hacky, but don't feel like changing the Web3Conect code base to allow style passing
  or am i missing something? */
  #WEB3_CONNECT_MODAL_ID > div > div > div:last-child {
      display: flex;
      width: 100%;
      max-width: 60rem;
      background: var(--color-background-pageWrapper);
      flex-flow: column wrap;
      margin: 0;
      padding: 0 1.6rem 1.6rem;
      
      &::before {
        content: "Connect A Wallet";
        width: 100%;
        display: block;
        font-size: 1.6rem;
        line-height: 1;
        padding: 2.4rem 0;
        box-sizing: border-box;
        color: var(--color-text-primary);
        font-weight: var(--font-weight-bold);
      }
    
    /* Individual outer container */
    > div {
      background: var(--color-background-pageWrapper);
      border-radius: var(--border-radius);
      color: var(--color-text-primary);
      display: flex;
      flex-flow: row wrap;
      flex: 1 1 100%;
      border: 0;
    }
    
    /* Individual inner container */
    > div > div {
      background: var(--color-background-pageWrapper);
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin: 0;
      opacity: 1;
      width: 100%;
      outline: none;
      border-radius: 1.2rem;
      padding: 1rem;
      border: 0.1rem solid var(--color-background-banner);
      flex-flow: row nowrap;
      transition: border .2s ease-in-out;
      min-height: 5.6rem;
      
        &:hover {
          border: 0.1rem solid var(--color-text-active);
        }
    }
    
    /* Provider image */
    > div > div > div:nth-of-type(1) {
      background: 0;
      box-shadow: none;
      width: 2.4rem;
      height: 2.4rem;
      display: block;
      overflow: visible;
        > img {
          display: block;
          width: 2.4rem;
          height: 2.4rem;
          object-fit: contain;
        }
    }
    
    /* Client name */
    > div > div > div:nth-of-type(2) {
      font-size: 1.5rem;
      text-align: left;
      padding: 0 1.2rem;
      margin: 0;
      color: var(--color-text-primary);
    }
    
    /* Client description */
    > div > div > div:nth-of-type(3) {
      font-size: 1.5rem;
      color: var(--color-text-primary);
      white-space: nowrap;
    }
  }
  /* End WEB3 connect */
  
  /* Start WalletConnect Modal */
  #walletconnect-qrcode-modal {
    .walletconnect-modal__headerLogo {
      max-width: 24rem;
      margin: 2.4rem auto;
    }
    
    .walletconnect-qrcode__image {
      height: calc(100vh - 14rem);
      padding: 1rem;
      max-height: 40rem;
    }
  }
  #walletconnect-qrcode-text {
    font-size: 1.8rem;
    line-height: 1.2;
    padding: 0 2rem;
    color: var(--color-text-primary);
  }
  /* End WalletConnect Modal */
`

export default GlobalStyles
