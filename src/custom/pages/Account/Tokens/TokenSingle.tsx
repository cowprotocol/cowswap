import { Content } from 'components/Page'
import { Wrapper, AccountPageWrapper } from '../styled'
import { AccountMenu } from '../Menu'
import { useParams } from 'react-router-dom'

type RouterParams = {
  address: string
}

export default function Token() {
  const { address } = useParams<RouterParams>()

  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <Content>
          <h2 id="tokens">Single token page</h2>
          <p>Address: {address}</p>
        </Content>
      </AccountPageWrapper>
    </Wrapper>
  )
}
