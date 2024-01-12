import React from 'react'
import styled from 'styled-components'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { SimpleTable, Props } from './'

export default {
  title: 'Common/SimpleTable',
  component: SimpleTable,
  decorators: [GlobalStyles, ThemeToggler],
  argTypes: { header: { control: null }, children: { control: null } },
} as Meta

const Template: Story<Props & { Component?: typeof SimpleTable }> = (args) => {
  const { Component = SimpleTable, ...rest } = args
  return <Component {...rest} />
}

export const BasicTable = Template.bind({})
BasicTable.args = {
  numColumns: 2,
  header: (
    <tr>
      <th>Name</th>
      <th>Year</th>
    </tr>
  ),
  body: (
    <>
      <tr>
        <td>DutchX</td>
        <td>2018</td>
      </tr>
      <tr>
        <td>dxDAO</td>
        <td>2019</td>
      </tr>
      <tr>
        <td>Gnosis Protocol v1</td>
        <td>2020</td>
      </tr>
      <tr>
        <td>Gnosis Protocol v2</td>
        <td>2021</td>
      </tr>
    </>
  ),
}

const CustomSimpleTable = styled(SimpleTable)`
  tr > td {
    &:not(:first-of-type) {
      text-align: right;
    }

    &.long {
      color: var(--color-long);
      border-left: 0.2rem solid var(--color-long);
    }

    &.short {
      color: var(--color-short);
      border-left: 0.2rem solid var(--color-short);
    }
  }

  > thead > tr,
  > tbody > tr {
    grid-template-columns: 5rem minmax(14rem, 1fr) repeat(5, 1fr) 7rem;
  }
`

export const CustomTableStyle = Template.bind({})
CustomTableStyle.args = {
  Component: CustomSimpleTable,
  header: (
    <tr>
      <th>Side</th>
      <th>Date</th>
      <th>Pair</th>
      <th>Limit price</th>
      <th>Amount WETH</th>
      <th>Filled WETH</th>
      <th>Expires</th>
      <th>Status</th>
    </tr>
  ),
  body: (
    <>
      {[...Array(10).keys()].map((i) => (
        <tr key={i}>
          <td className={i % 2 === 1 ? 'long' : 'short'}>{i % 2 === 1 ? 'Buy' : 'Sell'}</td>
          <td>01-10-2020 17:45:{i}2</td>
          <td>WETH/USDT</td>
          <td>370.96</td>
          <td>
            {i}.0{i}
          </td>
          <td>{i}</td>
          <td>Never</td>
          <td className="action">Active</td>
        </tr>
      ))}
    </>
  ),
}

export const NoHeader = Template.bind({})
NoHeader.args = { ...BasicTable.args, header: undefined }
