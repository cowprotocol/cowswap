import { Wrapper, Sidebar, Content } from './styled'

export function Configurator({ title }: { title: string }) {
  return (
    <Wrapper>
      <Sidebar>
        <h1>{title}</h1>
        <select>
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </Sidebar>

      <Content>
        <iframe
          src="https://swap-dev-git-widget-ui-5b-cowswap.vercel.app/#/1/widget/swap/COW/WETH?sellAmount=1200&theme=light"
          width="400px"
          height="640px"
          title="widget"
        />
      </Content>
    </Wrapper>
  )
}
