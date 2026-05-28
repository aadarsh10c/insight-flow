import { createFileRoute } from '@tanstack/react-router'
import { StyleguidePage } from './-styleguide-page'

const StyleguideRouteComponent = () => <StyleguidePage />

export const Route = createFileRoute('/styleguide')({
  component: StyleguideRouteComponent,
})
