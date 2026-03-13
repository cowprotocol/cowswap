import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

export const Section = styled.section`
  --padding: 16px;

  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: var(--padding);

  & + & {
    padding-top: calc(var(--padding) * 1.5);
    // Same as in apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.styled.tsx:
    border-top: 1px solid ${({ theme }) => transparentize(theme.white, 0.95)};
  }
`

export const Title = styled.h4`
  font-weight: 600;
  font-size: 15px;
  color: inherit;
  margin: 0;
`

/*


  font-weight: 600;
  font-size: 15px;
  color: inherit;
  width: 100%;
  text-align: left;
  margin: 0;

*/
