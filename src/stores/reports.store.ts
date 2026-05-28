import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DataSourceId } from '@/types/data-source.type'
import type { ChartConfig } from '@/types/chart.type'
import type { ColumnConfigMap, Report, ReportId } from '@/types/report.type'
import { asReportId, newId } from '@/lib/ids'

type AddInput = {
  name: string
  description: string
  dataSourceId: DataSourceId
  columnConfig: ColumnConfigMap
}

type ReportsState = { list: Report[] }

type ReportsActions = {
  add: (input: AddInput) => Report
  update: (id: ReportId, patch: Partial<Pick<Report, 'name' | 'description' | 'columnConfig'>>) => void
  delete: (id: ReportId) => void
  setChart: (id: ReportId, chart: ChartConfig) => void
  clearChart: (id: ReportId) => void
}

const touch = (r: Report): Report => ({ ...r, updatedAt: Date.now() })

export const useReportsStore = create<ReportsState & ReportsActions>()(
  persist(
    (set, get) => ({
      list: [],
      add: (input) => {
        const now = Date.now()
        const r: Report = {
          id: asReportId(newId()),
          name: input.name,
          description: input.description,
          dataSourceId: input.dataSourceId,
          columnConfig: input.columnConfig,
          createdAt: now,
          updatedAt: now,
        }
        set({ list: [...get().list, r] })
        return r
      },
      update: (id, patch) =>
        set({ list: get().list.map((r) => (r.id === id ? touch({ ...r, ...patch }) : r)) }),
      delete: (id) => set({ list: get().list.filter((r) => r.id !== id) }),
      setChart: (id, chart) =>
        set({ list: get().list.map((r) => (r.id === id ? touch({ ...r, chart }) : r)) }),
      clearChart: (id) =>
        set({ list: get().list.map((r) => (r.id === id ? touch({ ...r, chart: undefined }) : r)) }),
    }),
    { name: 'insightflow:reports', storage: createJSONStorage(() => localStorage) }
  )
)

export const useReportsList = () => useReportsStore((s) => s.list)
export const useReportById = (id: ReportId | undefined) =>
  useReportsStore((s) => (id ? (s.list.find((r) => r.id === id) ?? null) : null))
export const useReportsByDataSourceId = (dsId: DataSourceId | undefined) =>
  useReportsStore((s) => (dsId ? s.list.filter((r) => r.dataSourceId === dsId) : []))
