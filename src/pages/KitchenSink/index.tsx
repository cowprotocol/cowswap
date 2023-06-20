import { PinkTitle } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Page, Title, Content } from 'modules/application/pure/Page'

const Wrapper = styled(Page)``

export default function KitchenSink() {
  return (
    <Wrapper>
      <Title>Kitchen Sink</Title>
      <Content>
        <PinkTitle>pink title</PinkTitle>
      </Content>
    </Wrapper>
  )
}
