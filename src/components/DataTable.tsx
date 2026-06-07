import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column {
  key: string
  header: string
  render?: (row: any, index: number) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: Record<string, unknown>[]
}

export default function DataTable({ columns, data }: DataTableProps) {
  if (data.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16">
        <Inbox className="h-12 w-12 text-surface-600" />
        <p className="mt-3 text-sm text-surface-500">暂无数据</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-700/50 bg-surface-800/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="table-header sticky top-0 px-4 py-3 bg-surface-800/40"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'border-b border-surface-700/30 transition-colors hover:bg-surface-800/30',
                  rowIndex % 2 === 1 && 'bg-surface-800/20'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">
                    {col.render
                      ? col.render(row, rowIndex)
                      : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
