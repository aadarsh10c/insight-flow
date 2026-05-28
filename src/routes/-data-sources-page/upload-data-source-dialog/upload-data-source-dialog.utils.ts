export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_ROW_COUNT = 50_000

export const stripExtension = (filename: string): string => filename.replace(/\.(csv|xlsx)$/i, '')

export const getFileTypeOrNull = (filename: string): 'csv' | 'xlsx' | null => {
  if (/\.csv$/i.test(filename)) return 'csv'
  if (/\.xlsx$/i.test(filename)) return 'xlsx'
  return null
}

export const checkSizeLimit = (sizeBytes: number, rowCount: number): string | null => {
  if (sizeBytes > MAX_FILE_SIZE_BYTES || rowCount > MAX_ROW_COUNT) {
    return 'This file is too large for browser processing. Try a sample of up to 50,000 rows.'
  }
  return null
}
