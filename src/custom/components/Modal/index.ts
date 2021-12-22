import styled from 'styled-components/macro'
import Modal from '@src/components/Modal'
import { HeaderRow, ContentWrapper, CloseIcon, HoverText } from 'components/WalletModal/WalletModalMod'

export * from '@src/components/Modal'
export { default } from '@src/components/Modal'

export const GpModal = styled(Modal)<{ maxWidth?: number; backgroundColor?: string; border?: string }>`
  > [data-reach-dialog-content] {
    background-color: ${({ backgroundColor, theme }) => (backgroundColor ? backgroundColor : theme.bg1)};
    max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '470px')};
    border: ${({ border }) => (border ? border : 'inherit')};
    z-index: 100;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      max-height: 100%;
      max-width: 100%;
      height: 100%;
      width: 100vw;
      border-radius: 0;
      overflow-y: auto;
    `}

    ${HeaderRow} {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 16px;
        background: ${({ theme }) => theme.bg1};
        z-index: 20;
      `}
    }

    ${CloseIcon} {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        z-index: 21;
        position: fixed;
      `}
    }

    ${HoverText} {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        white-space: nowrap;
      `}
    }

    ${ContentWrapper} {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        margin: 62px auto 0;
      `}
    }
  }
`
