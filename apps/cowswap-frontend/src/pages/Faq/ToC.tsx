import { LinkScrollable } from 'legacy/components/Link'

import { Content, Title } from 'modules/application/pure/Page'

import { PageIndex } from './styled'

import { TocSection } from '.'

export default function Toc(props: { toc: TocSection[]; name: string }) {
  const { toc, name } = props
  return (
    <PageIndex>
      <Title id="cowswap-faq">{name}</Title>
      <Content>
        {toc.map(({ section, items }) => (
          <div key={section.id}>
            <LinkScrollable href={'#' + section.id}>{section.label}</LinkScrollable>
            <ul>
              {items.map((tocItem) => (
                <li key={tocItem.id}>
                  <LinkScrollable href={'#' + tocItem.id}>{tocItem.label}</LinkScrollable>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Content>
    </PageIndex>
  )
}
