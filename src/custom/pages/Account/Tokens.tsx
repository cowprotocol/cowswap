import { Content } from 'components/Page'
import { Wrapper, AccountPageWrapper } from './styled'
import { AccountMenu } from './Menu'

export default function Tokens() {
  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <Content>
          <h2 id="tokens">Tokens</h2>
        </Content>
      </AccountPageWrapper>
    </Wrapper>
  )
}
