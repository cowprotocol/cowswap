import styled from 'styled-components'
import Modal from '@src/components/Modal'
import { HeaderRow, ContentWrapper, CloseIcon, HoverText } from 'components/WalletModal/WalletModalMod'

export * from '@src/components/Modal'
export { default } from '@src/components/Modal'

export const GpModal = styled(Modal)`
  > [data-reach-dialog-content] {
    background-color: ${({ theme }) => theme.bg1};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      max-height: 100%;
      height: 100%;
      width: 100vw;
      border-radius: 0;
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
