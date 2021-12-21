import styled from 'styled-components/macro'
import CowProtocolIcon from 'assets/cow-swap/cowprotocol.svg'

const Icon = styled.span<Props>`
  ${({ theme }) => theme.cowToken.background};
  ${({ theme }) => theme.cowToken.boxShadow};
  height: ${({ size }) => (size ? `${size}px` : '24px')};
  width: ${({ size }) => (size ? `${size}px` : '24px')};
  display: inline-block;
  margin: 0;
  border-radius: ${({ size }) => (size ? `${size}px` : '24px')};
  position: relative;

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
