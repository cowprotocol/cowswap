import { PinkTitle } from '@cowprotocol/ui'
import { CowSwapWidgetSettings } from '@cowprotocol/widget-lib'
import { CowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-react'

import styled from 'styled-components/macro'

import { Page, Title, Content } from 'modules/application/pure/Page'

const Wrapper = styled(Page)``

export default function KitchenSink() {
  const cowSwapWidgetParams: CowSwapWidgetParams = {
    width: 600,
    height: 700,
    metaData: {
      appKey: 'KitchenSink',
      url: '/',
    },
  }

  const cowSwapWidgetSettings: CowSwapWidgetSettings = {
    urlParams: {
      chainId: 1,
      tradeType: 'swap',
      env: 'local',
    },
    appParams: {},
  }

  return (
    <Wrapper>
      <Title>Kitchen Sink</Title>
      <Content>
        <PinkTitle>pink title</PinkTitle>

        <CowSwapWidget params={cowSwapWidgetParams} settings={cowSwapWidgetSettings} />
      </Content>
    </Wrapper>
  )
}
