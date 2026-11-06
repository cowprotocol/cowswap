import { Collapsible, ExternalLink, font, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ $framed?: boolean }>`
  --gap: 16px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--gap);
  padding: 20px;
  width: 100%;
  ${({ $framed }) =>
    $framed
      ? `
    border: 1px solid var(${UI.COLOR_BORDER});
    border-radius: 12px;
    overflow: hidden;
  `
      : ''}

  ${Media.upToSmall()} {
    --gap: 10px;
    padding: 10px;
  }
`

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
`

export const Eyebrow = styled.span`
  ${font('FONT_OVERLINE', 'semibold')}
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(${UI.COLOR_TEXT}) 65%, transparent);
  text-transform: uppercase;
`

export const Title = styled.h3`
  ${font('FONT_LARGE', 'semibold')}
  margin: 0;
  color: var(${UI.COLOR_TEXT});
`

export const Subtitle = styled.p`
  ${font('FONT_SMALL_PLUS', 'regular')}
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const BidsRoot = styled(Collapsible.Root)`
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  width: 100%;
`

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const ExtraSolvers = styled.li`
  overflow: hidden;
  min-height: 0;
`

export const ExtraList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
`

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  width: 100%;
`

export const ViewMoreButton = styled(Collapsible.Trigger)`
  --collapsible-trigger-hover-background: transparent;
  --collapsible-trigger-open-hover-background: transparent;

  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  width: fit-content;
  min-height: unset;
  margin: 0;
  padding: 4px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: color-mix(in srgb, var(${UI.COLOR_TEXT}) 80%, transparent);
  cursor: pointer;
  ${font('FONT_SMALL_PLUS', 'semibold')}
  line-height: 1;
  text-align: left;

  &[data-panel-open] {
    background: transparent;
    color: color-mix(in srgb, var(${UI.COLOR_TEXT}) 80%, transparent);
  }

  &:not([aria-disabled='true']):hover {
    background: transparent;
    opacity: 0.85;
  }
`

export const AuctionDocsLink = styled(ExternalLink)`
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  ${font('FONT_SMALL', 'medium')}
  line-height: 1;
`
