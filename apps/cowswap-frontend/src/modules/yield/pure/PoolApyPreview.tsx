import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const Wrapper = styled.div<{ isSuperior: boolean }>`
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ isSuperior }) =>
    isSuperior ? `var(${UI.COLOR_COWAMM_LIGHT_GREEN})` : `var(${UI.COLOR_TEXT_OPACITY_25})`};
  color: ${({ isSuperior }) => (isSuperior ? `var(${UI.COLOR_COWAMM_DARK_GREEN})` : `var(${UI.COLOR_TEXT})`)};
`

interface PoolApyPreviewProps {
  apy: number | undefined
  isSuperior: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PoolApyPreview({ apy, isSuperior }: PoolApyPreviewProps) {
  if (typeof apy !== 'number') return null

  return <Wrapper isSuperior={isSuperior}>{apy}% APR</Wrapper>
}
