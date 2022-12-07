import styled from 'styled-components/macro'

export const Container = styled.div`
  padding: 2rem 1.2rem;
`

export const TitleSection = styled.div`
  text-align: center;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    & h4 {
      font-size: 1.2rem;
    }
  `};
`

export const Title = styled.h4`
  font-weight: 600;
  font-size: 1.6rem;
  margin: 10px 0;
`

export const SubTitle = styled.h4`
  font-weight: 400;
  font-size: 1.6rem;
  opacity: 0.8;
  margin: 10px 0;
`

export const BodySection = styled.div`
  display: flex;
  padding: 1rem 0;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-direction: column;
    max-width: 250px;
    margin: 0 auto;
  `};
`

export const BodyColumn = styled.div``
export const ControlSection = styled.div`
  text-align: center;

  & a {
    margin-bottom: 1.2rem;
    display: block;
  }
`

export const Item = styled.div`
  display: flex;
  padding: 10px 5px;
  font-size: 0.8rem;
`

export const Icon = styled.div<{ type: string }>`
  margin-right: 10px;
  color: ${({ type, theme }) => {
    if (type === 'completed') return theme.green1
    if (type === 'pending') return theme.yellow1
    return theme.primary1
  }};
`
