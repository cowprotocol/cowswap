import React from 'react'
import styled from 'styled-components'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import StyledTabs from './ExplorerTabs'
import { Props as TabsProps } from '../../../../../components/common/Tabs/Tabs'

export default {
  title: 'ExplorerApp/ExplorerTabs',
  component: StyledTabs,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const tabItems = [
  {
    id: 1,
    tab: 'Orders',
    content: (
      <div>
        <h2>Orders Content</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In libero mauris, dictum a orci ac, congue commodo
          quam. Fusce ac accumsan diam. Nulla facilisi. Pellentesque ullamcorper ullamcorper metus, at viverra turpis
          tristique vulputate. Ut dictum ac elit sit amet ultricies. Aliquam ultricies ante arcu, maximus malesuada leo
          dignissim vitae. Nulla facilisi. Quisque sit amet arcu sed nulla hendrerit euismod. Donec gravida sollicitudin
          libero, a auctor tortor convallis non. Nullam malesuada enim eu sollicitudin sodales. Nullam accumsan, nunc
          sed ultrices elementum, lorem diam vulputate turpis, a ultrices tortor mauris id mauris. Pellentesque a
          commodo libero, et convallis leo. Aenean facilisis arcu id magna scelerisque feugiat. Sed accumsan arcu vel
          consequat lobortis. Proin gravida lacinia massa eu fringilla. Nulla venenatis sodales tempus. Nam convallis
          justo vitae sollicitudin iaculis. Ut vehicula enim vel interdum varius. Aliquam erat volutpat. Pellentesque
          sed tellus in dui pulvinar blandit et et elit. Quisque nec metus fringilla, laoreet orci id, scelerisque
          velit.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    tab: 'Trades',
    content: (
      <>
        <h2>Trades Content</h2>
      </>
    ),
  },
]

const Wrapper = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

interface SProps {
  text: string
}
const SimpleComponent: React.FC<SProps> = (props) => {
  return <h2>{props.text}</h2>
}

const ExtraComponentNode: React.ReactNode = (
  <Wrapper>
    <SimpleComponent text="ExtraComponent_1" />
    <SimpleComponent text="ExtraComponent_2" />
  </Wrapper>
)

const Template: Story<TabsProps> = (args) => <StyledTabs {...args} />

export const DefaultTabs = Template.bind({})
DefaultTabs.args = { tabItems, extra: ExtraComponentNode }
