import { UI, Media } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

export const BannerWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 24px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  margin: 10px 0;
  color: var(${UI.COLOR_TEXT});
`

export const CloseButton = styled(X)`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const Content = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 16px;
`

export const Title = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: inherit;

  ${Media.upToSmall()} {
    font-size: 20px;
  }
`

export const Subtitle = styled.p`
  font-size: 16px;
  margin: 0;
  color: inherit;
`

export const BulletPoints = styled.ul`
  margin: 0;
  padding: 0 0 0 20px;
  list-style: disc;
  color: inherit;

  li {
    margin: 8px 0;
    line-height: 1.5;
  }
`

export const CTAButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_LIGHTER});
  }
`

export const DismissLink = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin: 0 auto;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`
