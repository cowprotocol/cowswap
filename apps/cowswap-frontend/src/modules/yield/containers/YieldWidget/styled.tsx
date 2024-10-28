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
