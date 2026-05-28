export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const formatRelativeTime = (epoch: number): string => {
  const diff = Date.now() - epoch
  const min = 60_000
  const hr = 60 * min
  const day = 24 * hr
  if (diff < min) return 'Just now'
  if (diff < hr) return `${Math.floor(diff / min)} minutes ago`
  if (diff < day) return `${Math.floor(diff / hr)} hours ago`
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`
  if (diff < 30 * day) return 'Last week'
  return new Date(epoch).toLocaleDateString()
}
