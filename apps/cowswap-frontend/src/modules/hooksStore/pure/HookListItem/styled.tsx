import { UI, Media } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

const BaseButton = css`
  display: flex;
  cursor: pointer;
  outline: none;
  font-size: 14px;
  text-decoration: none;
  padding: 11px;
  line-height: 1;
  margin: 0;
  border-radius: 21px;
  min-width: 84px;
  justify-content: center;
  transition: all 0.2s ease-in-out;
`

export const LinkButton = styled.button<{ disabled?: boolean }>`
  ${BaseButton}
  background: ${({ disabled }) => `var(${disabled ? UI.COLOR_PRIMARY_OPACITY_10 : UI.COLOR_PRIMARY})`};
  color: ${({ disabled }) => `var(${disabled ? UI.COLOR_TEXT_OPACITY_50 : UI.COLOR_PAPER})`};
  border: none;
  font-weight: 600;
  font-size: 16px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${Media.upToSmall()} {
    width: 100%;
    padding: 16px;
  }

  &:hover {
    background: ${({ disabled }) => `var(${disabled ? UI.COLOR_PRIMARY_OPACITY_10 : UI.COLOR_PRIMARY_DARKEST})`};
  }
`

export const RemoveButton = styled.button`
  ${BaseButton}
  background: transparent;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  color: var(${UI.COLOR_TEXT});

  &:hover {
    background: var(${UI.COLOR_DANGER_BG});
    color: var(${UI.COLOR_DANGER_TEXT});
    border-color: var(${UI.COLOR_DANGER_BG});
  }
`

export const HookDappListItem = styled.li<{ isDescriptionView?: boolean; isCompatible?: boolean }>`
  width: 100%;
  background: transparent;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  position: relative;
  gap: 16px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: ${({ isDescriptionView }) => (isDescriptionView ? '0' : '16px')};
  padding: ${({ isDescriptionView }) => (isDescriptionView ? '0' : '16px 10px')};
  border: 1px solid var(${UI.COLOR_PRIMARY_OPACITY_10});
  transition: all 0.2s ease-in-out;
  margin: 0;
  cursor: pointer;
  background: ${({ isCompatible }) => (isCompatible ? `var(${UI.COLOR_PAPER})` : `var(${UI.COLOR_PAPER_DARKER})`)};

  &::after {
    content: ${({ isCompatible }) => (isCompatible ? 'none' : '"This hook is not compatible with your wallet"')};
    color: var(${UI.COLOR_ALERT_TEXT});
    font-size: 12px;
    background-color: var(${UI.COLOR_ALERT_BG});
    padding: 4px 8px;
    border-radius: 12px;
    display: ${({ isCompatible }) => (isCompatible ? 'none' : 'block')};
    width: 100%;
    text-align: center;
    margin: 0 0 -8px;
  }

  &:hover {
    background: ${({ isDescriptionView }) =>
      isDescriptionView ? 'transparent' : `var(${UI.COLOR_PRIMARY_OPACITY_10})`};
    border: 1px solid transparent;
  }

  > img,
  > span > img {
    --size: 72px;
    width: var(--size);
    height: var(--size);
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    border-radius: 16px;
    overflow: hidden;
    background-color: var(${UI.COLOR_PAPER_DARKER});
    padding: 10px;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;

    ${Media.upToSmall()} {
      width: 100%;
      gap: 21px;
    }

    > i {
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 3px;
      margin: 10px 0 0;
      transition: all 0.2s ease-in-out;
      font-style: normal;
      color: var(${UI.COLOR_TEXT_OPACITY_50});

      ${Media.upToSmall()} {
        font-size: 15px;
      }

      &:hover {
        color: var(${UI.COLOR_TEXT});
      }
    }

    > i > svg {
      --size: 13px;
      height: var(--size);
      width: var(--size);
      object-fit: contain;
      color: inherit;

      > path {
        fill: currentColor;
      }
    }
  }
`

export const HookDappDetails = styled.div<{ isDescriptionView?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 0;
  font-size: 14px;
  gap: ${({ isDescriptionView }) => (isDescriptionView ? '16px' : '4px')};
  color: inherit;
  width: ${({ isDescriptionView }) => (isDescriptionView ? '100%' : 'auto')};

  > h3 {
    font-size: ${({ isDescriptionView }) => (isDescriptionView ? '24px' : '16px')};
    font-weight: 600;
    margin: 0;
    line-height: 1;
    cursor: pointer;
  }

  > h3 > i {
    --size: 14px;
    width: var(--size);
    height: var(--size);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(${UI.COLOR_TEXT_OPACITY_50});
    transition: all 0.2s ease-in-out;

    &:hover {
      color: var(${UI.COLOR_TEXT});
    }
  }

  > p {
    text-align: left;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    margin: 0;
    padding: 0;
  }

  a {
    display: block;
    text-decoration: underline;
  }
`

export const Link = styled.button`
  display: inline-block;
  cursor: pointer;
  margin: 0;
  background: none;
  border: none;
  outline: none;
  color: inherit;

  font-weight: 600;
  font-size: 12px;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const Version = styled.span<{ isDescriptionView?: boolean }>`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  display: block;
  margin: 10px 0 0;
  font-size: 12px;
  text-align: ${({ isDescriptionView }) => (isDescriptionView ? 'center' : 'left')};
`
