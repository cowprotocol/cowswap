import { Media } from '@cowprotocol/ui'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import AppDataWrapper from '../../../components/common/AppDataWrapper'
import ExplorerTabs from '../../components/common/ExplorerTabs/ExplorerTabs'
import { ContentCard as Content, Wrapper as WrapperTemplate } from '../styled'

export const StyledExplorerTabs = styled(ExplorerTabs)`
  margin: 1.6rem auto 0;
`

export const Wrapper = styled(WrapperTemplate)`
  max-width: 118rem;
  .disclaimer {
    font-size: 1.2rem;
    line-height: 1.3;
    display: block;
    margin-bottom: 1rem;
    ol {
      padding-left: 2rem;
      li {
        margin: 0.5rem 0 0.5rem 0;
      }
    }
  }
  .info-header {
    margin-bottom: 2rem;
    font-size: 1.5rem;
    &.box {
      padding: 3rem 4rem;
      background: ${({ theme }): string => theme.background};
      border-radius: 0.4rem;
    }
    a {
      margin: 0 0.5rem 0 0.5rem;
      color: ${({ theme }): string => theme.orange};
    }
    &.inner-form {
      h2 {
        margin-bottom: 2rem;
      }
      margin-bottom: 3rem;
      font-size: 1.2rem;
    }
    p {
      line-height: 1.5;
      margin: 0;
    }
  }
  ${Content} {
    display: flex;
    flex-direction: column;
    border: 0;
    padding: 0;
    .form-container {
      ${AppDataWrapper} {
        align-items: center;
      }
    }
    ${AppDataWrapper} {
      flex: 1;
      padding-left: 2rem;

      ${Media.upToSmall()} {
        padding-left: 0;
      }
    }
    .json-formatter {
      line-height: 1.25;

      ${Media.upToMedium()} {
        max-width: 45vw;
      }

      ${Media.upToSmall()} {
        max-width: none;
      }

      &.error {
        background: ${({ theme }): string => transparentize(0.8, theme.error)};
      }
    }
    .hidden-content {
      padding: 0 1rem;
      border-radius: 0.5rem;
      font-size: 1.3rem;
      line-height: 1.6;
      &:not(.error) {
        background: ${({ theme }): string => theme.greyOpacity};
      }
    }
    .appData-hash {
      margin: 0 0 1rem 0;
      max-width: 55rem;
      border: 1px solid ${({ theme }): string => theme.tableRowBorder};
      padding: 0.75rem;
      background: ${({ theme }): string => theme.tableRowBorder};
      border-radius: 0.5rem;
      ${Media.upToSmall()} {
        max-width: none;
        margin: 1rem 0;
      }
      span,
      a {
        font-size: 1.3rem;
        line-height: 1.3;
      }
    }
  }

  .form-container {
    display: flex;
    flex: 1;
    padding: 0 2rem;

    ${Media.upToSmall()} {
      margin: 2rem 0;
      flex-direction: column;
    }

    ${Media.upToMedium()} {
      margin: 2rem 0;
    }

    p {
      line-height: 1.6rem;
    }

    i.glyphicon {
      display: none;
    }
    .btn-add::after {
      content: 'Add';
    }
    .array-item-copy::after {
      content: 'Copy';
    }
    .array-item-move-up::after {
      content: 'Move Up';
    }
    .array-item-move-down::after {
      content: 'Move Down';
    }
    .array-item-remove::after {
      content: 'Remove';
    }

    .hidden-content {
      ${Media.LargeAndUp()} {
        position: sticky;
        top: 2.8rem;
        width: 30vw;
      }

      ${Media.MediumAndUp()} {
        position: sticky;
        top: 3rem;
        width: 35vw;
      }

      ${Media.upToSmall()} {
        margin-top: 1.5rem;
        background: none;
        padding: 1rem;
        font-size: 1.2rem;
      }

      ${Media.LargeAndUp()} {
        position: sticky;
        top: 4rem;
        width: 60rem;
      }

      h2 {
        margin: 2rem 0 2rem 0;
        font-size: 2rem;
      }
    }
  }

  .decode-container {
    display: flex;
    gap: 10rem;
    flex: 1;
    padding: 0 2rem;

    .left-pannel {
      display: flex;
      flex-direction: column;
      width: 40vw;
    }

    ${Media.upToSmall()} {
      margin: 2rem 0;
      flex-direction: column;
      gap: 5rem;
    }

    ${Media.upToMedium()} {
      margin: 2rem 0;
    }
  }

  .ipfs-container {
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
    width: 40rem;
    gap: 2rem;

    ${Media.upToSmall()} {
      width: 100%;
    }

    form {
      input {
        width: 100%;
      }
    }

    p {
      padding-right: 0;
    }
  }

  button {
    &:disabled {
      opacity: 0.3;
      pointer-events: none;
    }
  }

  input[type='text'] {
    height: 5rem;
    width: 100%;
    flex: 1 1 auto;
    background: ${({ theme }): string => theme.greyOpacity};
    font-weight: ${({ theme }): string => theme.fontMedium};
    font-size: 1.6rem;
    border-radius: 0.6rem;
    line-height: 1;
    display: flex;
    outline: 0;
    appearance: none;
    align-items: center;
    color: ${({ theme }): string => theme.greyShade};
    padding: 1.6rem;
    box-sizing: border-box;
    border: 0.1rem solid transparent;
    transition: border 0.2s ease-in-out;
    margin: 0.5rem 0 1rem 0;

    &:read-only {
      cursor: not-allowed;
    }

    &:focus {
      border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
    }
  }
  .btn.btn-info {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: ${({ theme }): string => theme.fontBold};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    width: 100%;
    color: ${({ theme }): string => theme.orange1};
    border: 1px solid ${({ theme }): string => theme.orange1};
    background-color: ${({ theme }): string => theme.orangeOpacity};
    border-radius: 0.4rem;
    padding: 0.8rem 1.5rem;
    transition-duration: 0.2s;
    transition-timing-function: ease-in-out;

    ${Media.upToSmall()} {
      margin: 1rem 0 0 0;
    }

    :hover {
      opacity: 0.8;
      color: ${({ theme }): string => theme.white};
      text-decoration: none;
    }
  }
  .data-form {
    fieldset {
      padding: 0.6rem 1rem;
      border-radius: 0.6rem;
      border: 1px solid ${({ theme }): string => theme.borderPrimary};
      legend {
        padding: 0.5rem;
      }
    }
    .form-group {
      margin-bottom: 1rem;
      .title-container {
        display: flex;
        align-items: center;
      }
      max-width: 40rem;
      ${Media.upToSmall()} {
        max-width: 100%;
      }
    }
    .field-description {
      font-size: 1.3rem;
    }
    .error-detail {
      padding: 0;
      li {
        list-style: none;
        line-height: normal;
        color: ${({ theme }): string => theme.error};
        font-size: 1.3rem;
      }
    }
  }

  ${Media.upToMedium()} {
    flex-flow: column wrap;
  }

  .appData-tab {
    &--encode {
      .tab-content {
        display: flex;
        flex-direction: column;
      }
    }

    &--decode {
      .data-container {
        line-height: 1.6;
        font-size: 1.3rem;
        margin: 1rem 0;
      }

      .main-container {
        width: 100%;
      }

      .data-form {
        width: 100%;
        max-width: 40rem;
        margin-right: 2rem;
        ${Media.upToSmall()} {
          max-width: 100%;
          margin-right: 0;
        }
        input {
          margin-top: 1rem;
        }
      }
      .hidden-content {
        position: initial;
      }
    }
  }

  span.error {
    color: ${(props): string => props.theme.error};
  }
`
export const IpfsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 40rem;
  ${Media.upToSmall()} {
    width: 100%;
  }
  button {
    margin: 1rem 0;
  }
  .form-group:first-child {
    margin-top: -0.7rem;
    label {
      background: ${({ theme }): string => theme.paper};
      padding: 0 0.2rem;
    }
    svg {
      background: ${({ theme }): string => theme.paper};
      width: 2.2rem;
    }
  }
`
