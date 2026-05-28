import { useCallback, useState } from 'react'
import { useDataSourcesStore } from '@/stores/data-sources.store'
import { useToastStore } from '@/stores/toast.store'
import { detectColumnTypes } from '@/lib/parsers/detect-types'
import { formatBytes } from '@/lib/utils/format'
import type { RowData } from '@/types/data-source.type'
import {
  checkSizeLimit,
  getFileTypeOrNull,
  stripExtension,
} from './upload-data-source-dialog.utils'
import type {
  UploadDataSourceDialogView,
  UseUploadDataSourceDialogParams,
} from './upload-data-source-dialog.type'

type ParsedFile = {
  rows: RowData[]
  errors: string[]
  type: 'csv' | 'xlsx'
}

const parseFile = async (file: File, type: 'csv' | 'xlsx'): Promise<ParsedFile> => {
  if (type === 'csv') {
    const text = await file.text()
    const { parseCSV } = await import('@/lib/parsers/csv')
    const r = await parseCSV(text)
    return { rows: r.rows, errors: r.errors, type }
  }
  const buf = await file.arrayBuffer()
  const { parseXLSX } = await import('@/lib/parsers/xlsx')
  const r = await parseXLSX(buf)
  return { rows: r.rows, errors: r.errors, type }
}

export const useUploadDataSourceDialog = (
  params: UseUploadDataSourceDialogParams
): UploadDataSourceDialogView => {
  const { onClose } = params
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rowCount, setRowCount] = useState<number | null>(null)

  const addDataSource = useDataSourcesStore((s) => s.add)
  const showToast = useToastStore((s) => s.show)

  const reset = useCallback(() => {
    setFile(null)
    setName('')
    setNameError(null)
    setFileError(null)
    setRowCount(null)
  }, [])

  const handleFileChange = useCallback((next: File | null) => {
    setFileError(null)
    setRowCount(null)
    if (next === null) {
      setFile(null)
      setName('')
      return
    }
    const type = getFileTypeOrNull(next.name)
    if (type === null) {
      setFileError('Please upload a CSV or Excel file.')
      setFile(null)
      return
    }
    setFile(next)
    setName(stripExtension(next.name))
  }, [])

  const handleNameChange = useCallback((value: string) => {
    setName(value)
    setNameError(value.trim() === '' ? 'Name is required' : null)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (file === null || name.trim() === '') return
    const type = getFileTypeOrNull(file.name)
    if (type === null) {
      setFileError('Unsupported file type')
      return
    }

    setIsSubmitting(true)
    try {
      const parsed = await parseFile(file, type)

      if (parsed.rows.length === 0) {
        setFileError('This file appears empty.')
        return
      }

      const sizeError = checkSizeLimit(file.size, parsed.rows.length)
      if (sizeError) {
        setFileError(sizeError)
        return
      }

      if (parsed.errors.length > 0) {
        showToast({
          variant: 'destructive',
          title: 'Parse warnings',
          description: parsed.errors.slice(0, 3).join('; '),
        })
      }

      addDataSource({
        name: name.trim(),
        filename: file.name,
        type,
        sizeBytes: file.size,
        columns: detectColumnTypes(parsed.rows),
        rows: parsed.rows,
      })

      reset()
      onClose()
    } catch (err) {
      showToast({
        variant: 'destructive',
        title: 'Could not parse file',
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [file, name, addDataSource, showToast, onClose, reset])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    reset()
    onClose()
  }, [isSubmitting, onClose, reset])

  const fileType = file ? getFileTypeOrNull(file.name) : null

  return {
    file,
    name,
    nameError,
    fileError,
    isSubmitting,
    canSubmit: file !== null && name.trim() !== '' && !isSubmitting,
    rowCount,
    fileTypeLabel: fileType ? fileType.toUpperCase() : null,
    formattedSize: file ? formatBytes(file.size) : '',
    handleFileChange,
    handleNameChange,
    handleSubmit,
    handleClose,
  }
}
