import { transparentize, lighten } from 'polished'
import { X } from 'react-feather'
import styled from 'styled-components/macro'

export const InfoPopup = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  line-height: 1.3;
  background: ${({ theme }) => `linear-gradient(90deg, ${theme.bg1} 0%, ${lighten(0.03, theme.bg1)} 100%)`};
  border-radius: 16px;
  padding: 15px 34px 15px 15px;

  .icon {
    --size: 32px;
    display: flex;
    align-items: center;
    width: var(--size);
    height: var(--size);
    min-width: var(--size);
    min-height: var(--size);
  }

  .icon > svg {
    --size: 32px;
    width: 100%;
    height: 100%;

    > path {
      fill: ${({ theme }) => transparentize(0.5, theme.text1)};
    }
  }

  .content > a {
    color: ${({ theme }) => theme.text1};
    text-decoration: underline;

    &::after {
      content: ' ↗';
      display: inline-block;
      font-size: 12px;
    }
  }
`

export const CloseIcon = styled(X)`
  --size: 16px;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 10px;
  stroke-width: 3px;
  transition: opacity 0.2s ease-in-out;
  height: var(--size);
  width: var(--size);
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`
