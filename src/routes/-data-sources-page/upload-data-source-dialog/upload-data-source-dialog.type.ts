export type UploadDataSourceDialogProps = {
  open: boolean
  onClose: () => void
}

export type UseUploadDataSourceDialogParams = UploadDataSourceDialogProps

export type UploadDataSourceDialogView = {
  file: File | null
  name: string
  nameError: string | null
  fileError: string | null
  isSubmitting: boolean
  canSubmit: boolean
  rowCount: number | null
  fileTypeLabel: string | null
  formattedSize: string
  handleFileChange: (file: File | null) => void
  handleNameChange: (value: string) => void
  handleSubmit: () => Promise<void>
  handleClose: () => void
}
