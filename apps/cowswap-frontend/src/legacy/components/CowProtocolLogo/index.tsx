import CowProtocolIcon from '@cowprotocol/assets/cow-swap/cow_token.svg'
import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Icon = styled.span<Props>`
  --defaultSize: 24px;
  --smallSize: 28px;
  background: url(${CowProtocolIcon}) no-repeat center/contain;
  height: ${({ size }) => (size ? `${size}px` : 'var(--defaultSize)')};
  width: ${({ size }) => (size ? `${size}px` : 'var(--defaultSize)')};
  display: inline-block;
  margin: 0;
  border-radius: ${({ size }) => (size ? `${size}px` : 'var(--defaultSize)')};
  position: relative;

  ${Media.upToMedium()} {
    width: var(--smallSize);
    height: var(--smallSize);
    border-radius: var(--smallSize);
  }
`

interface Props {
  size?: number | undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function CowProtocolLogo({ size }: Props) {
  return <Icon size={size} />
}
