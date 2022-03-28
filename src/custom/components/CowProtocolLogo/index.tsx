import styled from 'styled-components/macro'
import CowProtocolIcon from 'assets/cow-swap/cow_v2.svg'

export const Icon = styled.span<Props>`
  --defaultSize: 24px;
  --smallSize: ${({ size }) => (size ? `calc(${size}px / 1.5)` : 'calc(var(--defaultSize) / 1.5)')};
  background: url(${CowProtocolIcon}) no-repeat center/contain;
  height: ${({ size }) => (size ? `${size}px` : 'var(--defaultSize)')};
  width: ${({ size }) => (size ? `${size}px` : 'var(--defaultSize)')};
  display: inline-block;
  margin: 0;
  border-radius: ${({ size }) => (size ? `${size}px` : 'var(--defaultSize)')};
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: var(--smallSize);
    height: var(--smallSize);
    border-radius: var(--smallSize);
  `};
`

interface Props {
  size?: number | undefined
}

export default function CowProtocolLogo({ size }: Props) {
  return <Icon size={size} />
}
