import { Check, Database, FilePlus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDataSourceTable } from './data-source-table.hook'
import type { DataSourceTableProps } from './data-source-table.type'

const SKELETON_ROWS = [0, 1, 2]

export const DataSourceTable = (props: DataSourceTableProps) => {
  const view = useDataSourceTable(props)

  if (view.isHydrating) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKELETON_ROWS.map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-7 w-28" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (view.isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <Database className="mb-4 h-12 w-12 text-accent opacity-40" aria-hidden />
        <p className="text-title text-foreground">No data sources yet</p>
        <p className="mt-1 text-sm">Click "+ Add data source" to upload a CSV or Excel file.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {view.enrichedItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-2 font-medium">
                  {item.name}
                  {item.isMostRecent && (
                    <span
                      aria-label={`Most recent: ${item.name}`}
                      className="inline-grid h-4 w-4 place-items-center rounded-full bg-success text-white"
                    >
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{item.formattedSize}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono text-[11px] uppercase">
                  {item.type}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{item.formattedUploadedAt}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => view.handleCreateReport(item.id)}
                >
                  <FilePlus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Create Report
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
