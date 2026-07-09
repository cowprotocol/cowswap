import type { ConfiguratorFormValues } from '../../configurator.types'

export type ConfiguratorFormInputEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export interface ConfiguratorFormChangeHandler {
  (event: ConfiguratorFormInputEvent): void
  <K extends keyof ConfiguratorFormValues>(name: K, value: ConfiguratorFormValues[K] | null): void
}

export interface SidebarSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}
