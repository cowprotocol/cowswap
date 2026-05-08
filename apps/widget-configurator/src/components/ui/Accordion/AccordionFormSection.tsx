import type { ComponentType, ReactNode } from 'react'

import { AccordionSection } from './AccordionSection'

interface AccordionFormSectionProps<TValues, TOnChange, TFormProps extends object = object> {
  title: string
  expandedSection: string | null
  onToggleExpanded: (title: string) => (isExpanded: boolean) => void
  values: TValues
  onChange: TOnChange
  formComponent: ComponentType<
    {
      values: TValues
      onChange: TOnChange
    } & TFormProps
  >
  formProps?: TFormProps
}

export function AccordionFormSection<TValues, TOnChange, TFormProps extends object = object>({
  title,
  expandedSection,
  onToggleExpanded,
  values,
  onChange,
  formComponent: FormComponent,
  formProps,
}: AccordionFormSectionProps<TValues, TOnChange, TFormProps>): ReactNode {
  const isExpanded = expandedSection === title

  return (
    <AccordionSection title={title} expandedSection={expandedSection} onToggleExpanded={onToggleExpanded}>
      {isExpanded ? <FormComponent values={values} onChange={onChange} {...(formProps || ({} as TFormProps))} /> : null}
    </AccordionSection>
  )
}
