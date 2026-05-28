import type { ReactNode } from 'react'

export type StepCardStatus = 'locked' | 'active' | 'complete' | 'reset'

export type StepCardProps = {
  status: StepCardStatus
  stepNumber: 1 | 2 | 3 | 4
  title: string
  optional?: boolean
  summary?: string
  resetReason?: string
  onExpand?: () => void
  children?: ReactNode
}
