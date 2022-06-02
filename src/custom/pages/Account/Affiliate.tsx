import { Content } from 'components/Page'
import { Wrapper, AccountPageWrapper } from './styled'
import { AccountMenu } from './Menu'

export default function Affiliate() {
  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <Content>
          <h2 id="general">Affiliate</h2>
        </Content>
      </AccountPageWrapper>
    </Wrapper>
  )
}
