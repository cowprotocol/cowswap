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
