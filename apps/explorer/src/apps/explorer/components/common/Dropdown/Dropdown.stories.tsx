import React, { ReactElement, useState } from 'react'
import styled, { css } from 'styled-components'

import { Meta, Story } from '@storybook/react'
import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { Dropdown, DropdownProps, DropdownOption, DropdownDirection, DropdownPosition } from './index'

export default {
  title: 'ExplorerApp/Dropdown',
  component: Dropdown,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const PaginationTextCSS = css`
  color: ${({ theme }): string => theme.textPrimary1};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: normal;
  white-space: nowrap;
`

const PaginationDropdownButton = styled.button`
  ${PaginationTextCSS}
  cursor: pointer;
  white-space: nowrap;
  background: none;
  border: none;

  &.selected {
    background-color: transparent;
    cursor: not-allowed;
    font-weight: 400;
    opacity: 0.5;
    pointer-events: none;
  }
`
const PaginationWrapper = styled(Dropdown)`
  &.pageSize {
    .dropdown-options {
      min-width: 60px;
    }
  }

  &.upward-dropdown {
    margin-top: 9rem;
  }
`
type TemplateProps = DropdownProps & {
  options: Array<number | string>
}

const Template: Story<TemplateProps> = (args) => {
  const { options, dropdownDirection, className } = args
  const [selectedOption, setSelectedOption] = useState(options[0])

  const dropdownOptions = (items: Array<string | number>): Array<ReactElement> =>
    items.map((value) => (
      <DropdownOption key={value} onClick={(): void => setSelectedOption(value)}>
        {value}
      </DropdownOption>
    ))

  return (
    <PaginationWrapper
      className={className}
      currentItem={options.findIndex((option) => option === selectedOption)}
      items={dropdownOptions(options)}
      dropdownButtonContent={<PaginationDropdownButton>{selectedOption} ▼</PaginationDropdownButton>}
      dropdownButtonContentOpened={
        <PaginationDropdownButton className="selected">{selectedOption} ▲</PaginationDropdownButton>
      }
      dropdownDirection={dropdownDirection}
    />
  )
}

export const TextDropdown = Template.bind({})
TextDropdown.args = {
  options: ['All Orders', 'Filled', 'Cancelled'],
  className: 'upward-dropdown',
  dropdownDirection: DropdownDirection.upwards,
  dropdownPosition: DropdownPosition.right,
}

export const NumberDropdown = Template.bind({})
NumberDropdown.args = {
  options: [15, 30, 50, 100],
  className: 'pageSize',
  dropdownDirection: DropdownDirection.downwards,
}
