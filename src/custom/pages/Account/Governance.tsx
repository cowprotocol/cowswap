import { Content } from 'components/Page'
import { Wrapper, AccountPageWrapper } from './styled'
import { AccountMenu } from './Menu'

export default function Governance() {
  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <Content>
          <h2 id="governance">Governance</h2>
        </Content>
      </AccountPageWrapper>
    </Wrapper>
  )
}
