import styled from 'styled-components/macro'

const Wrapper = styled.span<{ width: string; whiteSpace: string }>`
  width: ${({ width }) => width};
  white-space: ${({ whiteSpace }) => whiteSpace};
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`

type TruncatedProps = {
  children: string
  width?: string
  className?: string
  whiteSpace?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TruncatedText(props: TruncatedProps) {
  const { children, className, width = '12ch', whiteSpace = 'nowrap' } = props

  return (
    <Wrapper className={className} width={width} whiteSpace={whiteSpace}>
      {children}
    </Wrapper>
  )
}
