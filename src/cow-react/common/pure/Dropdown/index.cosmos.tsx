import { Dropdown, DropdownProps } from './index'
import styled from 'styled-components/macro'

const Content = styled.div`
  border: 1px solid #e3e3e3;
  border-radius: 6px;
  padding: 8px;
  background: #ffffff;
`

const defaultProps: DropdownProps = {
  content: (
    <Content>
      <p>Hey! This is content of the dropdown!</p>
      <p>positionX: right | left</p>
      <p>positionY: top | bottom</p>
    </Content>
  ),
  children: <button>Click me</button>,
  isOpened: false,
  positionX: 'right',
  positionY: 'bottom',
}

export default <Dropdown {...defaultProps} />
