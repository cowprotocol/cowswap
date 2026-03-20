import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const FloatingWrapper = styled.div`
  position: fixed;
  right: 46px;
  bottom: 126px;
  z-index: 20;

  ${Media.upToSmall()} {
    right: 12px;
    bottom: 12px;
  }
`

export const Panel = styled.div`
  width: min(540px, calc(100vw - 24px));
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  background: var(${UI.COLOR_WARNING_BG});
  color: var(${UI.COLOR_WARNING_TEXT});
  border: 1px solid var(${UI.COLOR_WARNING});
  border-radius: 20px;
  box-shadow: var(${UI.BOX_SHADOW_3});
  padding: 16px;
  scrollbar-width: thin;

  ${Media.upToSmall()} {
    width: min(360px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    padding: 14px;
  }
`

export const BodyGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 16px;
  align-items: start;

  ${Media.upToSmall()} {
    grid-template-columns: 1fr;
  }
`

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`

export const Heading = styled.div`
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
`

export const Description = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
`

export const StorageNote = styled(Description)`
  margin-top: 6px;
  opacity: 0.82;
`

const IconButton = styled.button`
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform var(${UI.ANIMATION_DURATION}) ease-in-out,
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out,
    background var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    transform: translateY(-1px);
  }
`

export const CollapseButton = styled(IconButton)`
  width: 34px;
  min-width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(${UI.COLOR_WARNING});
  color: var(${UI.COLOR_BUTTON_TEXT});

  &:hover,
  &:focus-visible {
    opacity: 0.92;
  }
`

export const ToggleButton = styled(IconButton)`
  height: 56px;
  padding: 0 18px 0 16px;
  gap: 10px;
  border-radius: 999px;
  background: var(${UI.COLOR_WARNING});
  color: var(${UI.COLOR_BUTTON_TEXT});
  box-shadow: var(${UI.BOX_SHADOW_3});
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:hover,
  &:focus-visible {
    opacity: 0.92;
  }
`

export const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;

  > *:first-child {
    grid-column: 1 / -1;
  }
`

export const Section = styled.div`
  border-top: 1px solid color-mix(in srgb, var(${UI.COLOR_WARNING_TEXT}) 16%, transparent);
  padding-top: 14px;
`

export const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
`

export const SectionDescription = styled(Description)`
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.88;
`

export const ProxyMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.35;

  span {
    opacity: 0.8;
  }

  b {
    font-family: monospace;
  }
`

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;

  ${Media.upToSmall()} {
    grid-template-columns: 1fr;
  }
`

export const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  background: color-mix(in srgb, var(${UI.COLOR_WARNING_TEXT}) 7%, transparent);

  span {
    font-size: 12px;
    opacity: 0.78;
  }

  b {
    font-size: 18px;
    line-height: 1.1;
  }
`

export const ScenarioGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 12px;

  button {
    min-height: 40px;
    padding: 0 10px;
    font-size: 13px;
    white-space: normal;
    width: 100%;
  }

  ${Media.upToSmall()} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${Media.upToSmall()} {
    button {
      min-height: 42px;
    }
  }
`
