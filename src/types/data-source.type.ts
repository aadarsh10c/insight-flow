export type DataSourceId = string & { readonly __brand: 'DataSourceId' }

export type ColumnType = 'number' | 'category' | 'text' | 'date'

export type ColumnSchema = {
  name: string
  inferredType: ColumnType
}

export type RowData = Record<string, unknown>

export type DataSource = {
  id: DataSourceId
  name: string
  filename: string
  type: 'csv' | 'xlsx'
  sizeBytes: number
  uploadedAt: number
  columns: ColumnSchema[]
  rows: RowData[]
}
