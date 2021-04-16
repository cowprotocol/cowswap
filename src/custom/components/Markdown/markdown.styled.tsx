import styled from 'styled-components'
import AppBody from 'pages/AppBody'

export const PageWrapper = styled(AppBody)`
  padding: 0 24px 24px;
  max-width: ${({ theme }) => theme.appBody.maxWidth.content};
`

export const Title = styled.h1`
  font-size: 32px;
`

export const Content = styled.div`
  font-size: 15px;
  margin: 0 0 28px;
  display: block;

  > h2 {
    font-size: 18px;
  }

  > h2:not(:first-of-type)::before {
    content: '';
    display: block;
    border-top: 1px solid ${({ theme }) => theme.border};
    margin: 24px 0;
    opacity: 0.2;
  }

  /* underlined subheader */
  h4 {
    text-decoration: underline;
    font-weight: normal;
    // margin: 0;
  }

  > p {
    line-height: 1.5;
  }

  /* List styles */
  > ul,
  > ol {
    > li {
      /* Match 1st level list styles from G Docs */
      margin: 0 0 10px;
      list-style: lower-roman;

      > ul,
      > ol {
        > li {
          /* Match 2nd level list styles from G Docs */
          list-style: lower-alpha;
        }

        > h4:last-child {
          /* CSS hack to allow nested subheaders to be aligned */
          /* while keeping sequential lower roman bullets */
          margin-left: -2.4rem;
        }
      }
    }
  }

  #table-container {
    overflow-x: scroll;

    > table {
      min-width: 800px;

      thead, tr:nth-child(even) {
          background: lightgrey;
        }
      }

      th,
      td {
        min-width: 8.5rem;
        text-align: left;
        padding: 0.5rem 0.4rem;
      }
    }
  }
`
