import { ReactNode, Suspense } from 'react'
import { AccountMenu } from './Menu'
import { Content } from 'components/Page'
import { Wrapper, AccountPageWrapper } from './Tokens/styled'
import { Loading } from 'components/FlashingLoading'

export default function WrapperWithNav({ name, id, children }: { name: ReactNode; id: string; children: ReactNode }) {
  return (
    <Wrapper>
      <AccountMenu />
      <Suspense fallback={Loading}>
        <AccountPageWrapper>
          <Content>
            <h2 id={id}>{name}</h2>
            {children}
          </Content>
        </AccountPageWrapper>
      </Suspense>
    </Wrapper>
  )
}
