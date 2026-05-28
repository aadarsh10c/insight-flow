import { createFileRoute } from '@tanstack/react-router'

const IndexComponent = () => (
  <div className="p-8 text-3xl font-serif">Home placeholder</div>
)

export const Route = createFileRoute('/')({ component: IndexComponent })
