import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  height: 100vh;
  width: 100%;
`

export const Sidebar = styled.div`
  display: flex;
  flex-flow: column wrap;
  height: 100%;
  width: 29rem;
  background: white;
  box-shadow: rgba(5, 43, 101, 0.06) 0 1.2rem 1.2rem;
`

export const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  height: 100%;
  width: auto;
  flex: 1 1 auto;

  > iframe {
    border: 0;
    margin: 0 auto;
    border-radius: 1.6rem;
    overflow: hidden;
  }
`
