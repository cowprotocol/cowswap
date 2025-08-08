import type { ReactNode, HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

export const CustomTable = ({ children, ...props }: TableHTMLAttributes<HTMLTableElement>): ReactNode => (
  <table {...props}>{children}</table>
)

export const CustomTHead = ({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>): ReactNode => (
  <thead {...props}>{children}</thead>
)

export const CustomTBody = ({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>): ReactNode => (
  <tbody {...props}>{children}</tbody>
)

export const CustomTr = ({ children, ...props }: HTMLAttributes<HTMLTableRowElement>): ReactNode => (
  <tr {...props}>{children}</tr>
)

export const CustomTh = ({ children, ...props }: ThHTMLAttributes<HTMLTableCellElement>): ReactNode => (
  <th {...props}>{children}</th>
)

export const CustomTd = ({ children, ...props }: TdHTMLAttributes<HTMLTableCellElement>): ReactNode => (
  <td {...props}>{children}</td>
)
