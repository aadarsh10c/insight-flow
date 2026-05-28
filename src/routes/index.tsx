import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from './-home-page'

const IndexRouteComponent = () => <HomePage />

export const Route = createFileRoute('/')({ component: IndexRouteComponent })
