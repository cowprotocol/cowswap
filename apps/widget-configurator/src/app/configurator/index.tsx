import { Wrapper, Sidebar, Content } from './styled'

export function Configurator({ title }: { title: string }) {
  return (
    <Wrapper>
      <Sidebar>
        <h1>{title}</h1>
      </Sidebar>

      <Content>
        <p>Widget iFrame below:</p>
        <iframe src="https://swap-dev-git-feat-cow-widget-cowswap.vercel.app/#/1/widget/swap/COW/WETH?sellAmount=1200&amp;theme=light" width="400px" height="640px" title="widget" />
      </Content>
    </Wrapper>
  )
}
