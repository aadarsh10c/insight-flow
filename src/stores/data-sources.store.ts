import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ColumnSchema, DataSource, DataSourceId, RowData } from '@/types/data-source.type'
import { asDataSourceId, newId } from '@/lib/ids'

type AddInput = {
  name: string
  filename: string
  type: 'csv' | 'xlsx'
  sizeBytes: number
  columns: ColumnSchema[]
  rows: RowData[]
}

type DataSourcesState = {
  list: DataSource[]
  mostRecentId: DataSourceId | null
}

type DataSourcesActions = {
  add: (input: AddInput) => DataSource
}

export const useDataSourcesStore = create<DataSourcesState & DataSourcesActions>()(
  persist(
    (set, get) => ({
      list: [],
      mostRecentId: null,
      add: (input) => {
        const ds: DataSource = {
          id: asDataSourceId(newId()),
          ...input,
          uploadedAt: Date.now(),
        }
        set({ list: [...get().list, ds], mostRecentId: ds.id })
        return ds
      },
    }),
    { name: 'insightflow:dataSources', storage: createJSONStorage(() => localStorage) }
  )
)

export const useDataSourcesList = () => useDataSourcesStore((s) => s.list)
export const useDataSourceById = (id: DataSourceId | undefined) =>
  useDataSourcesStore((s) => (id ? (s.list.find((d) => d.id === id) ?? null) : null))
export const useMostRecentDataSourceId = () => useDataSourcesStore((s) => s.mostRecentId)
