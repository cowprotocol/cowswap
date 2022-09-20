import styled from 'styled-components/macro'

const Wrapper = styled.span`
  ${({ theme }) => theme.dancingCow}
  display: inline-block;
  width: 32px;
  height: 32px;
`

const DancingCow = () => {
  return <Wrapper />
}

export default DancingCow
