import styled from 'styled-components/macro'
import CowProtocolIcon from 'assets/cow-swap/cowprotocol.svg'

export const Icon = styled.span<Props>`
  --defaultSize: 24px;
  --smallSize: ${({ size }) => (size ? `calc(${size}px / 1.5)` : 'calc(var(--defaultSize) / 1.5)')};
  ${({ theme }) => theme.cowToken.background};
  ${({ theme }) => theme.cowToken.boxShadow};
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

  &::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 8%;
    bottom: 0;
    margin: auto;
    background: url(${CowProtocolIcon}) no-repeat center/70%;
  }
`

interface Props {
  size?: number | undefined
}

export default function CowProtocolLogo({ size }: Props) {
  return <Icon size={size} />
}
