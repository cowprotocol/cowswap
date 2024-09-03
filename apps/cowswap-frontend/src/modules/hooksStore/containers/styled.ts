import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CloseIcon as CloseIconOriginal } from 'common/pure/CloseIcon'

export const ExternalLinkContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`

export const LoaderWrapper = styled.div`
  margin: 0 20px;
`

export const ErrorWrapper = styled.div`
  text-align: right;
  display: flex;
  align-items: end;
  flex-direction: column;
  gap: 5px;
`

export const ErrorText = styled.div`
  color: var(${UI.COLOR_ALERT_TEXT});
`

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-flow: column wrap;
  justify-content: space-between;
  padding: 0;
`

export const AddHookButton = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px dashed var(${UI.COLOR_TEXT_OPACITY_25});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 13px;
  border-radius: 12px;
  width: 100%;
  justify-content: center;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  > svg {
    --size: 16px;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    color: currentColor;

    > path {
      fill: currentColor;
    }
  }

  &:hover {
    border-color: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_PRIMARY});
    background-color: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }
`

export const HookList = styled.ul`
  max-width: 100%;
  list-style: none;
  padding: 0 10px 0 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.8rem;
`

export const CloseIcon = styled(CloseIconOriginal)`
  position: absolute;
  top: 0;
  right: 0;
`

export const HookDappsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: stretch;
`

export const HookDappListItem = styled.li<{ imageBgContrast?: boolean; isDescriptionView?: boolean }>`
  width: 100%;
  background: transparent;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  position: relative;
  gap: 16px;
  border-radius: ${({ isDescriptionView }) => (isDescriptionView ? '0' : '16px')};
  padding: ${({ isDescriptionView }) => (isDescriptionView ? '0' : '16px 10px')};
  transition: all 0.2s ease-in-out;
  margin: 0 0 auto;

  &:hover {
    background: ${({ isDescriptionView }) =>
      isDescriptionView ? 'transparent' : `var(${UI.COLOR_PRIMARY_OPACITY_10})`};
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
    background-color: ${({ imageBgContrast }) =>
      imageBgContrast ? `var(${UI.COLOR_PRIMARY_OPACITY_80})` : `var(${UI.COLOR_PAPER_DARKER})`};
    padding: 10px;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    gap: 8px;

    > i {
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      font-style: normal;
      color: var(${UI.COLOR_TEXT_OPACITY_50});

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
  justify-content: space-between;
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
    flex-grow: 1;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    margin: 0;
    padding: 0;
  }

  a {
    display: block;
    text-decoration: underline;
  }
`

export const LinkButton = styled.button<{ onClick?: () => void }>`
  display: flex;
  cursor: pointer;
  margin: 0;
  background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  border: none;
  outline: none;
  color: inherit;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  padding: 11px;
  line-height: 1;
  display: block;
  margin: auto 0;
  border-radius: 21px;
  min-width: 84px;
  justify-content: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_PAPER});
  }
`

export const TextLink = styled.a`
  display: block;
  margin: 0 0 10px;
  font-size: inherit;
  text-align: left;
  color: var(${UI.COLOR_PRIMARY});
`

export const Version = styled.div<{ isDescriptionView?: boolean }>`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  display: block;
  margin: 10px 0 0;
  font-size: 12px;
  text-align: ${({ isDescriptionView }) => (isDescriptionView ? 'center' : 'left')};
`
