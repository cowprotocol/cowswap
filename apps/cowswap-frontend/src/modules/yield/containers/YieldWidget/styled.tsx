import { ProductLogo, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const CoWAmmLogo = styled(ProductLogo)`
  --size: 33px;
  width: var(--size) !important;
  height: var(--size);
  border-radius: var(--size);
  padding: 6px;
  background: var(${UI.COLOR_COWAMM_DARK_GREEN});
  color: var(${UI.COLOR_COWAMM_LIGHTER_GREEN});
`

export const SelectPoolBtn = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 64px;
  align-items: center;
  padding: 10px;
  gap: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  background: var(${UI.COLOR_COWAMM_LIGHT_GREEN});
  color: var(${UI.COLOR_COWAMM_DARK_GREEN});
  box-shadow: var(${UI.BOX_SHADOW});

  ${CoWAmmLogo} {
    transition: none !important;
  }

  &:hover {
    background: var(${UI.COLOR_COWAMM_DARK_GREEN});
    color: var(${UI.COLOR_COWAMM_LIGHT_GREEN});
    box-shadow: none;
  }

  &:hover ${CoWAmmLogo} {
    background: var(${UI.COLOR_COWAMM_LIGHTER_GREEN});
    color: var(${UI.COLOR_COWAMM_DARK_GREEN});
  }
`
