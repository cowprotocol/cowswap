import { css } from 'styled-components'

// TODO: may not need any of this current CSS for V2

export const web3ModalOverride = css`
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
      content: 'Connect A Wallet';
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
      transition: border 0.2s ease-in-out;
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
  /* End WEB3 connect */
`
