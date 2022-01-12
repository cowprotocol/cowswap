// Button.fixture.jsx
import {
  BaseButton,
  ButtonPrimary,
  ButtonLight,
  ButtonSecondary,
  ButtonGray,
  ButtonEmpty,
  ButtonYellow,
  ButtonOutlined,
} from '../index'
import { ReactElement } from 'react'

const examples = [
  {
    name: 'BaseButton',
    component: <BaseButton>BaseButton</BaseButton>,
  },
  {
    name: 'ButtonPrimary',
    component: <ButtonPrimary>ButtonPrimary</ButtonPrimary>,
  },
  {
    name: 'ButtonLight',
    component: <ButtonLight>ButtonLight</ButtonLight>,
  },
  {
    name: 'ButtonGray',
    component: <ButtonGray>ButtonGray</ButtonGray>,
  },
  {
    name: 'ButtonSecondary',
    component: <ButtonSecondary>ButtonSecondary</ButtonSecondary>,
  },
  {
    name: 'ButtonOutlined',
    component: <ButtonOutlined>ButtonOutlined</ButtonOutlined>,
  },
  {
    name: 'ButtonYellow',
    component: <ButtonYellow>ButtonYellow</ButtonYellow>,
  },
  {
    name: 'ButtonEmpty',
    component: <ButtonEmpty>ButtonEmpty</ButtonEmpty>,
  },
  {
    name: 'ButtonYellow',
    component: <ButtonYellow>ButtonYellow</ButtonYellow>,
  },
]

export default examples.reduce<{ [name: string]: ReactElement }>((acc, { name, component }) => {
  acc[name] = component
  return acc
}, {})
