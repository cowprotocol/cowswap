import type { ComponentType, ReactNode } from 'react'

import { AccordionSection } from './AccordionSection'

type BaseFormProps<TValues, TOnChange> = {
  values: TValues
  onChange: TOnChange
}

/**
 * Prevents TypeScript from inferring a generic from this position.
 * Used so `formProps` cannot widen the inferred props type beyond
 * what `formComponent` already declares.
 *
 * @example
 * ```ts
 * // Without NoInfer: second argument can widen T
 * function chooseWithoutNoInfer<T>(fixed: T, candidate: T): T {
 *   return fixed
 * }
 * const widened = chooseWithoutNoInfer('light' as const, 'dark')
 * //    ^? "light" | "dark" (candidate participates in inferring T)
 *
 * // With NoInfer: candidate is checked against already-inferred T
 * function chooseWithNoInfer<T>(fixed: T, candidate: NoInfer<T>): T {
 *   return fixed
 * }
 * const strict = chooseWithNoInfer('light' as const, 'light') // OK
 * chooseWithNoInfer('light' as const, 'dark') // Error
 * //                                 ^ candidate cannot widen T
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NoInfer<T> = [T][T extends any ? 0 : never]

interface AccordionFormSectionProps<
  TValues,
  TOnChange,
  TAllFormProps extends BaseFormProps<TValues, TOnChange> = BaseFormProps<TValues, TOnChange>,
> {
  title: string
  expandedSection: string | null
  onToggleExpanded: (title: string) => (isExpanded: boolean) => void
  values: TValues
  onChange: TOnChange
  formComponent: ComponentType<TAllFormProps>
  formProps?: NoInfer<Omit<TAllFormProps, keyof BaseFormProps<TValues, TOnChange>>>
}

export function AccordionFormSection<
  TValues,
  TOnChange,
  TAllFormProps extends BaseFormProps<TValues, TOnChange> = BaseFormProps<TValues, TOnChange>,
>({
  title,
  expandedSection,
  onToggleExpanded,
  values,
  onChange,
  formComponent: FormComponent,
  formProps,
}: AccordionFormSectionProps<TValues, TOnChange, TAllFormProps>): ReactNode {
  const isExpanded = expandedSection === title

  return (
    <AccordionSection title={title} expandedSection={expandedSection} onToggleExpanded={onToggleExpanded}>
      {isExpanded ? (
        <FormComponent
          {...({
            values,
            onChange,
            ...(formProps || {}),
          } as TAllFormProps)}
        />
      ) : null}
    </AccordionSection>
  )
}
