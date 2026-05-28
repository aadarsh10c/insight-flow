import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useDataSourceById, useDataSourcesList } from '@/stores/data-sources.store'
import { useReportsStore } from '@/stores/reports.store'
import type { DataSourceId } from '@/types/data-source.type'
import type { ColumnConfigMap } from '@/types/report.type'
import type { AddReportDialogView, UseAddReportDialogParams } from './add-report-dialog.type'
import { isValidReportInput, stripEmptyOverrides } from './add-report-dialog.utils'

export const useAddReportDialog = (
  params: UseAddReportDialogParams
): AddReportDialogView => {
  const { open, onClose, preselectedDataSourceId } = params
  const navigate = useNavigate()
  const list = useDataSourcesList()
  const addReport = useReportsStore((s) => s.add)

  const [selectedDataSourceId, setSelectedDataSourceId] = useState<DataSourceId | null>(
    preselectedDataSourceId ?? null
  )
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [columnConfig, setColumnConfig] = useState<ColumnConfigMap>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync preselection when dialog opens — external trigger, justified useEffect
  useEffect(() => {
    if (open && preselectedDataSourceId) {
      setSelectedDataSourceId(preselectedDataSourceId)
    }
  }, [open, preselectedDataSourceId])

  const selectedDataSource = useDataSourceById(selectedDataSourceId ?? undefined)

  const handleDataSourceChange = useCallback((id: DataSourceId) => {
    setSelectedDataSourceId(id)
    setColumnConfig({})
  }, [])

  const handleNameChange = useCallback((v: string) => setName(v), [])
  const handleDescriptionChange = useCallback((v: string) => setDescription(v), [])
  const handleColumnConfigChange = useCallback((next: ColumnConfigMap) => setColumnConfig(next), [])

  const handleSubmit = useCallback(() => {
    if (!isValidReportInput(selectedDataSourceId, name) || selectedDataSourceId === null) return
    setIsSubmitting(true)
    try {
      const report = addReport({
        name: name.trim(),
        description: description.trim(),
        dataSourceId: selectedDataSourceId,
        columnConfig: stripEmptyOverrides(columnConfig),
      })
      setName('')
      setDescription('')
      setColumnConfig({})
      setSelectedDataSourceId(null)
      onClose()
      // Forward reference: /reports/:reportId route is Phase 05
      navigate({ to: '/reports/$reportId' as never, params: { reportId: report.id } as never })
    } finally {
      setIsSubmitting(false)
    }
  }, [
    selectedDataSourceId,
    name,
    description,
    columnConfig,
    addReport,
    onClose,
    navigate,
  ])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    setName('')
    setDescription('')
    setColumnConfig({})
    setSelectedDataSourceId(null)
    onClose()
  }, [isSubmitting, onClose])

  return {
    availableDataSources: list,
    selectedDataSource,
    selectedDataSourceId,
    name,
    description,
    columnConfig,
    isEmpty: list.length === 0,
    emptyMessage: 'You have no data sources. Add one from the Data Sources page first.',
    isSubmitting,
    canSubmit: isValidReportInput(selectedDataSourceId, name) && !isSubmitting,
    handleDataSourceChange,
    handleNameChange,
    handleDescriptionChange,
    handleColumnConfigChange,
    handleSubmit,
    handleClose,
  }
}
