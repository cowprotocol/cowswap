import styled from 'styled-components/macro'

const Wrapper = styled.span<{ width: string }>`
  width: ${({ width }) => width};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`

type TruncatedProps = {
  text: string
  width?: string
  className?: string
}

export function TruncatedText(props: TruncatedProps) {
  const { text, className, width = '12ch' } = props

  return (
    <Wrapper className={className} width={width}>
      {text}
    </Wrapper>
  )
}
